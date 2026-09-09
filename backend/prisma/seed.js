import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();


// =====================================================
// CREATE USER
// =====================================================

async function createUser({
    firstName,
    lastName,
    phone,
    email,
    password,
    roleName
}) {

    const role = await prisma.role.findUnique({
        where: {
            name: roleName
        }
    });

    if (!role) {
        throw new Error(`${roleName} role not found.`);
    }

    const existingUser = await prisma.user.findUnique({
        where: {
            phone
        }
    });

    if (existingUser) {

        console.log(
            `ℹ️ ${roleName} already exists: ${phone}`
        );

        return existingUser;

    }

    const hashedPassword =
        await bcrypt.hash(password, 10);

    const user = await prisma.user.create({

        data: {

            firstName,
            lastName,
            phone,
            email,
            passwordHash: hashedPassword,

            userRoles: {

                create: {

                    roleId: role.id

                }

            }

        }

    });

    console.log(
        `✅ ${roleName} created: ${email}`
    );

    return user;

}


// =====================================================
// MAIN
// =====================================================

async function main() {

    console.log("🌱 Seeding database...");


    // =================================================
    // ROLES
    // =================================================

    const roles = [

        {
            name: "Customer",
            description: "Regular customer"
        },

        {
            name: "RestaurantManager",
            description: "Restaurant manager"
        },

        {
            name: "Driver",
            description: "Delivery driver"
        },

        {
            name: "SystemAdmin",
            description: "System administrator"
        }

    ];

    for (const role of roles) {

        await prisma.role.upsert({

            where: {
                name: role.name
            },

            update: {},

            create: role

        });

    }

    console.log("✅ Roles seeded.");


    // =================================================
    // SYSTEM ADMIN
    // =================================================

    await createUser({

        firstName: "System",
        lastName: "Administrator",

        phone: "09131313131",

        email: "admin@foodstore.com",

        password: "123456",

        roleName: "SystemAdmin"

    });


    // =================================================
    // CUSTOMERS
    // =================================================

    const customers = [];

    const firstCustomer = await createUser({

        firstName: "Customer",
        lastName: "Test",

        phone: "09131111111",

        email: "customer@foodstore.com",

        password: "123456",

        roleName: "Customer"

    });

    customers.push(firstCustomer);


    // Customers 2 - 50
    for (let i = 2; i <= 50; i++) {

        const customer = await createUser({

            firstName: `Customer${i}`,

            lastName: "Test",

            phone: `0913111${String(i).padStart(4, "0")}`,

            email: `customer${i}@foodstore.com`,

            password: "123456",

            roleName: "Customer"

        });

        customers.push(customer);

    }

    console.log("✅ 50 Customers ready.");


    // =================================================
    // CUSTOMER DELIVERY ADDRESSES
    // =================================================

    for (let i = 0; i < customers.length; i++) {

        const customer = customers[i];

        const existingAddress =
            await prisma.deliveryAddress.findFirst({

                where: {
                    userId: customer.id
                }

            });

        if (existingAddress) {

            console.log(
                `ℹ️ Address already exists for ${customer.email}`
            );

            continue;

        }

        await prisma.deliveryAddress.create({

            data: {

                userId: customer.id,

                title: "Home",

                receiverName:
                    `${customer.firstName} ${customer.lastName}`,

                receiverPhone:
                    customer.phone,

                address:
                    `Tehran, Valiasr Street, No. ${100 + i}`,

                isDefault: true

            }

        });

    }

    console.log("✅ Delivery addresses created for all customers.");

    // =================================================
    // RESTAURANT MANAGERS
    // =================================================

    const managers = [];

    const managerData = [

        ["Ali", "Ahmadi", "09132222221", "manager1@foodstore.com"],
        ["Reza", "Karimi", "09132222222", "manager2@foodstore.com"],
        ["Hassan", "Mohammadi", "09132222223", "manager3@foodstore.com"],
        ["Mehdi", "Hosseini", "09132222224", "manager4@foodstore.com"],
        ["Saeed", "Rahimi", "09132222225", "manager5@foodstore.com"],
        ["Amir", "Moradi", "09132222226", "manager6@foodstore.com"],
        ["Pouya", "Karimi", "09132222227", "manager7@foodstore.com"],
        ["Mohammad", "Ahmadi", "09132222228", "manager8@foodstore.com"],
        ["Arman", "Rezaei", "09132222229", "manager9@foodstore.com"],
        ["Nima", "Ebrahimi", "09132222230", "manager10@foodstore.com"]

    ];

    for (let i = 0; i < managerData.length; i++) {

        const [
            firstName,
            lastName,
            phone,
            email
        ] = managerData[i];

        const manager = await createUser({

            firstName,
            lastName,
            phone,
            email,

            password: "123456",

            roleName: "RestaurantManager"

        });

        managers.push(manager);

    }

    console.log("✅ 10 Restaurant Managers ready.");


    // =================================================
    // DRIVER
    // =================================================

    await createUser({

        firstName: "Driver",
        lastName: "Test",

        phone: "09133333333",

        email: "driver@foodstore.com",

        password: "123456",

        roleName: "Driver"

    });


    // =================================================
    // RESTAURANTS DATA
    // =================================================

    const restaurantsData = [

        {
            name: "Pizza House",
            slug: "pizza-house",
            description: "Fresh and delicious pizzas",
            phone: "02111111111",
            address: "Tehran, Valiasr Street",
            minimumOrder: 150000,
            deliveryFee: 30000
        },

        {
            name: "Burger Land",
            slug: "burger-land",
            description: "Classic and special burgers",
            phone: "02122222222",
            address: "Tehran, Keshavarz Boulevard",
            minimumOrder: 120000,
            deliveryFee: 25000
        },

        {
            name: "Iranian Taste",
            slug: "iranian-taste",
            description: "Traditional Iranian cuisine",
            phone: "02133333333",
            address: "Tehran, Saadat Abad",
            minimumOrder: 200000,
            deliveryFee: 35000
        },

        {
            name: "Tehran Fast Food",
            slug: "tehran-fast-food",
            description: "Delicious fast food for every taste",
            phone: "02144444444",
            address: "Tehran, Tajrish",
            minimumOrder: 120000,
            deliveryFee: 25000
        },

        {
            name: "Persian Kitchen",
            slug: "persian-kitchen",
            description: "Authentic Persian homemade dishes",
            phone: "02155555555",
            address: "Tehran, Vanak",
            minimumOrder: 180000,
            deliveryFee: 30000
        },

        {
            name: "Pizza Corner",
            slug: "pizza-corner",
            description: "Iranian and American style pizzas",
            phone: "02166666666",
            address: "Tehran, Ekbatan",
            minimumOrder: 150000,
            deliveryFee: 30000
        },

        {
            name: "Pasta Garden",
            slug: "pasta-garden",
            description: "Fresh pasta and Italian dishes",
            phone: "02177777777",
            address: "Tehran, Shahrak Gharb",
            minimumOrder: 160000,
            deliveryFee: 30000
        },

        {
            name: "Crispy Chicken",
            slug: "crispy-chicken",
            description: "Crispy fried chicken and fast food",
            phone: "02188888888",
            address: "Tehran, Sattarkhan",
            minimumOrder: 130000,
            deliveryFee: 25000
        },

        {
            name: "Sandwich House",
            slug: "sandwich-house",
            description: "Fresh sandwiches and fast food",
            phone: "02199999999",
            address: "Tehran, Yusef Abad",
            minimumOrder: 110000,
            deliveryFee: 25000
        },

        {
            name: "Potato & Drink",
            slug: "potato-and-drink",
            description: "Fries, snacks and refreshing drinks",
            phone: "02112121212",
            address: "Tehran, Jordan",
            minimumOrder: 100000,
            deliveryFee: 20000
        }

    ];


    // =================================================
    // CATEGORIES + FOODS
    // =================================================

    const restaurantMenus = [

        // =================================================
        // 1. PIZZA HOUSE
        // =================================================

        [

            {
                name: "Pizza",
                foods: [
                    ["Margherita Pizza", "Classic pizza with tomato sauce and cheese", 180000],
                    ["Pepperoni Pizza", "Pizza with pepperoni and mozzarella cheese", 230000],
                    ["Special Pizza", "Special pizza with beef, mushrooms and vegetables", 260000],
                    ["Chicken Pizza", "Pizza with grilled chicken and mushrooms", 220000],
                    ["Vegetable Pizza", "Pizza with fresh vegetables and mozzarella", 190000]
                ]
            },

            {
                name: "Appetizers",
                foods: [
                    ["Garlic Bread", "Fresh garlic bread with cheese", 90000],
                    ["Chicken Wings", "Crispy chicken wings", 150000],
                    ["Mozzarella Sticks", "Fried mozzarella cheese sticks", 120000],
                    ["Onion Rings", "Crispy fried onion rings", 90000],
                    ["Cheese Balls", "Crispy cheese balls", 110000]
                ]
            },

            {
                name: "Sides",
                foods: [
                    ["French Fries", "Crispy golden french fries", 80000],
                    ["Cheese Fries", "French fries with melted cheese", 110000],
                    ["Potato Wedges", "Seasoned potato wedges", 95000],
                    ["Coleslaw", "Fresh creamy coleslaw", 85000],
                    ["Caesar Salad", "Fresh Caesar salad with lettuce and dressing", 130000]
                ]
            },

            {
                name: "Drinks",
                foods: [
                    ["Coca Cola", "Cold Coca Cola", 40000],
                    ["Pepsi", "Cold Pepsi", 40000],
                    ["Orange Soda", "Refreshing orange soda", 40000],
                    ["Doogh", "Traditional Iranian yogurt drink", 45000],
                    ["Mineral Water", "Cold mineral water", 25000]
                ]
            },

            {
                name: "Desserts",
                foods: [
                    ["Chocolate Cake", "Soft chocolate cake", 100000],
                    ["Cheesecake", "Classic creamy cheesecake", 120000],
                    ["Brownie", "Chocolate brownie", 90000],
                    ["Ice Cream", "Vanilla ice cream", 80000],
                    ["Tiramisu", "Classic Italian tiramisu", 130000]
                ]
            }

        ],


        // =================================================
        // 2. BURGER LAND
        // =================================================

        [

            {
                name: "Burgers",
                foods: [
                    ["Classic Burger", "Beef burger with lettuce and tomato", 170000],
                    ["Cheese Burger", "Beef burger with cheddar cheese", 200000],
                    ["Double Burger", "Double beef burger with special sauce", 250000],
                    ["Mushroom Burger", "Beef burger with mushrooms and cheese", 220000],
                    ["BBQ Burger", "Beef burger with BBQ sauce and cheese", 230000],
                    ["Chicken Burger", "Crispy chicken burger with lettuce", 180000]
                ]
            },

            {
                name: "Fries",
                foods: [
                    ["Classic Fries", "Crispy golden french fries", 80000],
                    ["Cheese Fries", "French fries with melted cheese", 110000],
                    ["Loaded Fries", "Fries with cheese and special sauce", 130000],
                    ["Spicy Fries", "Spicy seasoned french fries", 95000],
                    ["Potato Wedges", "Seasoned potato wedges", 95000]
                ]
            },

            {
                name: "Chicken",
                foods: [
                    ["Chicken Nuggets", "Crispy chicken nuggets", 140000],
                    ["Chicken Wings", "Crispy chicken wings", 150000],
                    ["Chicken Strips", "Golden crispy chicken strips", 160000],
                    ["Popcorn Chicken", "Small crispy chicken pieces", 145000],
                    ["Mozzarella Sticks", "Crispy mozzarella sticks", 120000]
                ]
            },

            {
                name: "Drinks",
                foods: [
                    ["Pepsi", "Cold Pepsi", 40000],
                    ["Cola", "Cold Coca Cola", 40000],
                    ["Sprite", "Cold Sprite", 40000],
                    ["Doogh", "Traditional yogurt drink", 45000],
                    ["Mineral Water", "Cold mineral water", 25000]
                ]
            },

            {
                name: "Desserts",
                foods: [
                    ["Chocolate Cake", "Soft chocolate cake", 100000],
                    ["Brownie", "Chocolate brownie", 90000],
                    ["Ice Cream", "Vanilla ice cream", 80000],
                    ["Chocolate Shake", "Cold chocolate milkshake", 110000],
                    ["Vanilla Shake", "Cold vanilla milkshake", 100000]
                ]
            }

        ],


        // =================================================
        // 3. IRANIAN TASTE
        // =================================================

        [

            {
                name: "Iranian Food",
                foods: [
                    ["Ghormeh Sabzi", "Traditional Iranian herb stew with rice", 220000],
                    ["Gheymeh", "Traditional split pea stew with rice", 210000],
                    ["Fesenjan", "Walnut and pomegranate stew with rice", 240000],
                    ["Abgoosht", "Traditional Iranian meat and chickpea stew", 230000],
                    ["Kashk Bademjan", "Traditional eggplant appetizer", 150000]
                ]
            },

            {
                name: "Rice Dishes",
                foods: [
                    ["Sabzi Polo Mahi", "Persian herb rice served with fish", 280000],
                    ["Zereshk Polo", "Barberry rice served with chicken", 260000],
                    ["Baghali Polo", "Dill rice with fava beans and meat", 270000],
                    ["Adas Polo", "Lentil rice with raisins", 230000],
                    ["Shirin Polo", "Sweet Persian rice with chicken", 260000]
                ]
            },

            {
                name: "Kebab",
                foods: [
                    ["Chelo Kebab", "Iranian kebab with saffron rice", 280000],
                    ["Joojeh Kebab", "Grilled chicken kebab with rice", 260000],
                    ["Kebab Koobideh", "Classic minced meat kebab", 250000],
                    ["Barg Kebab", "Grilled beef fillet kebab", 320000],
                    ["Bakhtiari Kebab", "Mixed beef and chicken kebab", 300000]
                ]
            },

            {
                name: "Appetizers",
                foods: [
                    ["Shirazi Salad", "Fresh tomato, cucumber and onion salad", 90000],
                    ["Mast Khiar", "Yogurt with cucumber and herbs", 80000],
                    ["Kashk Bademjan", "Eggplant with whey and fried onion", 150000],
                    ["Mirza Ghasemi", "Smoked eggplant with tomato and egg", 150000],
                    ["Sabzi Khordan", "Fresh Persian herbs", 60000]
                ]
            },

            {
                name: "Drinks",
                foods: [
                    ["Doogh", "Traditional Iranian yogurt drink", 45000],
                    ["Mint Doogh", "Yogurt drink with fresh mint", 50000],
                    ["Saffron Drink", "Refreshing saffron drink", 60000],
                    ["Basil Seed Drink", "Refreshing basil seed drink", 55000],
                    ["Mineral Water", "Cold mineral water", 25000]
                ]
            }

        ],


        // =================================================
        // 4. TEHRAN FAST FOOD
        // =================================================

        [

            {
                name: "Burgers",
                foods: [
                    ["Classic Burger", "Classic beef burger", 170000],
                    ["Cheese Burger", "Beef burger with cheddar cheese", 200000],
                    ["Chicken Burger", "Crispy chicken burger", 180000],
                    ["Special Burger", "Special beef burger with cheese", 220000],
                    ["Mushroom Burger", "Burger with mushrooms and cheese", 220000]
                ]
            },

            {
                name: "Fried Chicken",
                foods: [
                    ["Fried Chicken", "Crispy fried chicken", 170000],
                    ["Chicken Strips", "Crispy chicken strips", 160000],
                    ["Chicken Nuggets", "Crispy chicken nuggets", 140000],
                    ["Chicken Wings", "Crispy chicken wings", 150000],
                    ["Popcorn Chicken", "Small crispy chicken pieces", 145000]
                ]
            },

            {
                name: "Sandwiches",
                foods: [
                    ["Chicken Sandwich", "Grilled chicken sandwich", 160000],
                    ["Beef Sandwich", "Beef sandwich with special sauce", 180000],
                    ["Hot Dog", "Classic hot dog with special sauce", 150000],
                    ["Steak Sandwich", "Beef steak sandwich", 220000],
                    ["Chicken Cheese Sandwich", "Chicken sandwich with cheese", 190000]
                ]
            },

            {
                name: "Fries",
                foods: [
                    ["French Fries", "Crispy french fries", 80000],
                    ["Cheese Fries", "Fries with cheese", 110000],
                    ["Spicy Fries", "Spicy seasoned fries", 95000],
                    ["Loaded Fries", "Fries with cheese and sauce", 130000],
                    ["Potato Wedges", "Seasoned potato wedges", 95000]
                ]
            },

            {
                name: "Drinks",
                foods: [
                    ["Cola", "Cold Coca Cola", 40000],
                    ["Pepsi", "Cold Pepsi", 40000],
                    ["Sprite", "Cold Sprite", 40000],
                    ["Orange Soda", "Orange flavored soda", 40000],
                    ["Mineral Water", "Cold mineral water", 25000]
                ]
            }

        ],


        // =================================================
        // 5. PERSIAN KITCHEN
        // =================================================

        [

            {
                name: "Persian Food",
                foods: [
                    ["Ghormeh Sabzi", "Traditional herb stew", 220000],
                    ["Gheymeh", "Split pea stew with rice", 210000],
                    ["Abgoosht", "Traditional Iranian meat and chickpea stew", 230000],
                    ["Fesenjan", "Walnut and pomegranate stew", 240000],
                    ["Khoresh Bademjan", "Eggplant stew with tomato sauce", 220000]
                ]
            },

            {
                name: "Kebab",
                foods: [
                    ["Chelo Kebab", "Iranian kebab with saffron rice", 280000],
                    ["Joojeh Kebab", "Grilled chicken kebab with rice", 260000],
                    ["Kebab Koobideh", "Classic minced meat kebab", 250000],
                    ["Barg Kebab", "Grilled beef fillet kebab", 320000],
                    ["Bakhtiari Kebab", "Mixed beef and chicken kebab", 300000]
                ]
            },

            {
                name: "Rice",
                foods: [
                    ["Zereshk Polo", "Barberry rice with chicken", 260000],
                    ["Baghali Polo", "Dill rice with fava beans and meat", 270000],
                    ["Adas Polo", "Lentil rice with raisins", 230000],
                    ["Shirin Polo", "Sweet Persian rice with chicken", 260000],
                    ["Tahchin", "Persian crispy rice with chicken", 250000]
                ]
            },

            {
                name: "Salads & Appetizers",
                foods: [
                    ["Shirazi Salad", "Fresh tomato cucumber and onion salad", 90000],
                    ["Mast Khiar", "Yogurt with cucumber and herbs", 80000],
                    ["Mirza Ghasemi", "Smoked eggplant with tomato and egg", 150000],
                    ["Kashk Bademjan", "Eggplant with whey and fried onion", 150000],
                    ["Sabzi Khordan", "Fresh Persian herbs", 60000]
                ]
            },

            {
                name: "Drinks",
                foods: [
                    ["Doogh", "Traditional yogurt drink", 45000],
                    ["Mint Doogh", "Yogurt drink with fresh mint", 50000],
                    ["Saffron Sharbat", "Traditional saffron drink", 60000],
                    ["Basil Seed Drink", "Refreshing basil seed drink", 55000],
                    ["Mineral Water", "Cold mineral water", 25000]
                ]
            }

        ],


        // =================================================
        // 6. PIZZA CORNER
        // =================================================

        [

            {
                name: "Iranian Pizza",
                foods: [
                    ["Persian Special Pizza", "Pizza with beef and mushrooms", 230000],
                    ["Iranian Mix Pizza", "Mixed Iranian style pizza", 240000],
                    ["Chicken Pizza", "Chicken and mushroom pizza", 220000],
                    ["Beef Pizza", "Pizza with beef and vegetables", 240000],
                    ["Special Meat Pizza", "Pizza with beef sausage and cheese", 260000]
                ]
            },

            {
                name: "American Pizza",
                foods: [
                    ["Pepperoni Pizza", "American style pepperoni pizza", 250000],
                    ["BBQ Chicken Pizza", "BBQ chicken pizza", 260000],
                    ["Meat Lovers Pizza", "Pizza with different types of meat", 280000],
                    ["Hawaiian Pizza", "Pizza with chicken and pineapple", 250000],
                    ["Four Cheese Pizza", "Pizza with four different cheeses", 270000]
                ]
            },

            {
                name: "Appetizers",
                foods: [
                    ["Garlic Bread", "Garlic bread with cheese", 90000],
                    ["Chicken Wings", "Crispy chicken wings", 150000],
                    ["Cheese Balls", "Crispy cheese balls", 120000],
                    ["Mozzarella Sticks", "Fried mozzarella sticks", 120000],
                    ["Onion Rings", "Crispy onion rings", 90000]
                ]
            },

            {
                name: "Sides",
                foods: [
                    ["French Fries", "Crispy french fries", 80000],
                    ["Cheese Fries", "French fries with cheese", 110000],
                    ["Potato Wedges", "Seasoned potato wedges", 95000],
                    ["Caesar Salad", "Fresh Caesar salad", 130000],
                    ["Coleslaw", "Fresh creamy coleslaw", 85000]
                ]
            },

            {
                name: "Drinks",
                foods: [
                    ["Coca Cola", "Cold Coca Cola", 40000],
                    ["Pepsi", "Cold Pepsi", 40000],
                    ["Sprite", "Cold Sprite", 40000],
                    ["Orange Soda", "Refreshing orange soda", 40000],
                    ["Mineral Water", "Cold mineral water", 25000]
                ]
            }

        ],


        // =================================================
        // 7. PASTA GARDEN
        // =================================================

        [

            {
                name: "Pasta",
                foods: [
                    ["Spaghetti Bolognese", "Spaghetti with meat sauce", 220000],
                    ["Chicken Alfredo", "Pasta with chicken and creamy sauce", 240000],
                    ["Penne Arrabbiata", "Penne pasta with spicy tomato sauce", 200000],
                    ["Penne Alfredo", "Penne with creamy Alfredo sauce", 230000],
                    ["Spaghetti Carbonara", "Spaghetti with creamy carbonara sauce", 240000]
                ]
            },

            {
                name: "Italian Food",
                foods: [
                    ["Lasagna", "Classic beef lasagna", 250000],
                    ["Chicken Parmesan", "Chicken with parmesan cheese", 260000],
                    ["Creamy Mushroom Pasta", "Pasta with creamy mushroom sauce", 230000],
                    ["Risotto", "Creamy Italian rice with mushrooms", 240000],
                    ["Chicken Risotto", "Italian risotto with chicken", 250000]
                ]
            },

            {
                name: "Salads",
                foods: [
                    ["Caesar Salad", "Fresh Caesar salad with dressing", 130000],
                    ["Greek Salad", "Greek salad with feta cheese", 140000],
                    ["Garden Salad", "Fresh mixed vegetable salad", 110000],
                    ["Chicken Salad", "Fresh salad with grilled chicken", 160000],
                    ["Caprese Salad", "Tomato mozzarella and basil salad", 150000]
                ]
            },

            {
                name: "Appetizers",
                foods: [
                    ["Garlic Bread", "Fresh garlic bread", 90000],
                    ["Bruschetta", "Italian toasted bread with tomato", 110000],
                    ["Mozzarella Sticks", "Crispy mozzarella sticks", 120000],
                    ["Chicken Wings", "Crispy chicken wings", 150000],
                    ["Potato Wedges", "Seasoned potato wedges", 95000]
                ]
            },

            {
                name: "Drinks",
                foods: [
                    ["Cola", "Cold Coca Cola", 40000],
                    ["Orange Soda", "Refreshing orange soda", 40000],
                    ["Lemonade", "Fresh homemade lemonade", 60000],
                    ["Iced Tea", "Cold iced tea", 50000],
                    ["Mineral Water", "Cold mineral water", 25000]
                ]
            }

        ],


        // =================================================
        // 8. CRISPY CHICKEN
        // =================================================

        [

            {
                name: "Fried Chicken",
                foods: [
                    ["Crispy Chicken", "Crispy fried chicken pieces", 180000],
                    ["Chicken Strips", "Golden chicken strips", 160000],
                    ["Spicy Chicken", "Spicy crispy chicken", 190000],
                    ["Chicken Wings", "Crispy chicken wings", 150000],
                    ["Popcorn Chicken", "Small crispy chicken pieces", 145000]
                ]
            },

            {
                name: "Chicken Meals",
                foods: [
                    ["Chicken Combo", "Chicken with fries and drink", 240000],
                    ["Family Chicken", "Large fried chicken meal", 450000],
                    ["Chicken Burger", "Crispy chicken burger", 180000],
                    ["Chicken Box", "Chicken pieces with fries", 280000],
                    ["Spicy Chicken Combo", "Spicy chicken with fries and drink", 260000]
                ]
            },

            {
                name: "Burgers",
                foods: [
                    ["Classic Chicken Burger", "Crispy chicken burger", 180000],
                    ["Cheese Chicken Burger", "Chicken burger with cheese", 200000],
                    ["Spicy Chicken Burger", "Spicy crispy chicken burger", 200000],
                    ["BBQ Chicken Burger", "Chicken burger with BBQ sauce", 210000],
                    ["Double Chicken Burger", "Double crispy chicken burger", 250000]
                ]
            },

            {
                name: "Fries",
                foods: [
                    ["French Fries", "Crispy fries", 80000],
                    ["Cheese Fries", "Fries with cheese", 110000],
                    ["Spicy Fries", "Spicy fries", 95000],
                    ["Loaded Fries", "Fries with cheese and sauce", 130000],
                    ["Potato Wedges", "Seasoned potato wedges", 95000]
                ]
            },

            {
                name: "Drinks",
                foods: [
                    ["Cola", "Cold Coca Cola", 40000],
                    ["Pepsi", "Cold Pepsi", 40000],
                    ["Sprite", "Cold Sprite", 40000],
                    ["Orange Soda", "Refreshing orange soda", 40000],
                    ["Mineral Water", "Cold mineral water", 25000]
                ]
            }

        ],


        // =================================================
        // 9. SANDWICH HOUSE
        // =================================================

        [

            {
                name: "Sandwiches",
                foods: [
                    ["Chicken Sandwich", "Grilled chicken sandwich", 160000],
                    ["Beef Sandwich", "Beef sandwich with special sauce", 180000],
                    ["Club Sandwich", "Classic three-layer club sandwich", 210000],
                    ["Tuna Sandwich", "Tuna sandwich with vegetables", 170000],
                    ["Roast Beef Sandwich", "Roast beef sandwich with cheese", 210000]
                ]
            },

            {
                name: "Hot Sandwiches",
                foods: [
                    ["Hot Dog", "Classic hot dog", 150000],
                    ["Steak Sandwich", "Beef steak sandwich", 220000],
                    ["Chicken Cheese Sandwich", "Chicken sandwich with cheese", 190000],
                    ["Sausage Sandwich", "Sausage sandwich with special sauce", 170000],
                    ["Mushroom Sandwich", "Mushroom sandwich with cheese", 180000]
                ]
            },

            {
                name: "Sides",
                foods: [
                    ["Classic Fries", "Crispy french fries", 80000],
                    ["Cheese Fries", "French fries with cheese", 110000],
                    ["Onion Rings", "Crispy onion rings", 90000],
                    ["Chicken Nuggets", "Crispy chicken nuggets", 140000],
                    ["Mozzarella Sticks", "Crispy mozzarella sticks", 120000]
                ]
            },

            {
                name: "Salads",
                foods: [
                    ["Caesar Salad", "Fresh Caesar salad", 130000],
                    ["Chicken Salad", "Fresh salad with grilled chicken", 160000],
                    ["Garden Salad", "Fresh mixed vegetable salad", 110000],
                    ["Coleslaw", "Fresh creamy coleslaw", 85000],
                    ["Greek Salad", "Greek salad with feta cheese", 140000]
                ]
            },

            {
                name: "Drinks",
                foods: [
                    ["Cola", "Cold Coca Cola", 40000],
                    ["Orange Soda", "Orange flavored soda", 40000],
                    ["Pepsi", "Cold Pepsi", 40000],
                    ["Doogh", "Traditional yogurt drink", 45000],
                    ["Mineral Water", "Cold mineral water", 25000]
                ]
            }

        ],


        // =================================================
        // 10. POTATO & DRINK
        // =================================================

        [

            {
                name: "French Fries",
                foods: [
                    ["Classic Fries", "Golden crispy french fries", 80000],
                    ["Cheese Fries", "French fries with cheese", 110000],
                    ["Special Fries", "Loaded fries with special sauce", 130000],
                    ["Spicy Fries", "Spicy seasoned fries", 95000],
                    ["Garlic Fries", "French fries with garlic sauce", 100000]
                ]
            },

            {
                name: "Snacks",
                foods: [
                    ["Mozzarella Sticks", "Crispy mozzarella sticks", 120000],
                    ["Onion Rings", "Crispy onion rings", 90000],
                    ["Chicken Nuggets", "Crispy chicken nuggets", 140000],
                    ["Chicken Wings", "Crispy chicken wings", 150000],
                    ["Cheese Balls", "Crispy cheese balls", 110000]
                ]
            },

            {
                name: "Chicken",
                foods: [
                    ["Chicken Strips", "Golden chicken strips", 160000],
                    ["Popcorn Chicken", "Small crispy chicken pieces", 145000],
                    ["Spicy Chicken", "Spicy crispy chicken", 190000],
                    ["Chicken Bites", "Small crispy chicken bites", 150000],
                    ["Chicken Combo", "Chicken with fries", 230000]
                ]
            },

            {
                name: "Dips",
                foods: [
                    ["Cheese Sauce", "Creamy cheese sauce", 40000],
                    ["Garlic Sauce", "Creamy garlic sauce", 35000],
                    ["BBQ Sauce", "Smoky BBQ sauce", 35000],
                    ["Spicy Sauce", "Hot spicy sauce", 35000],
                    ["Ranch Sauce", "Creamy ranch sauce", 35000]
                ]
            },

            {
                name: "Drinks",
                foods: [
                    ["Cola", "Cold Coca Cola", 40000],
                    ["Orange Soda", "Refreshing orange soda", 40000],
                    ["Pepsi", "Cold Pepsi", 40000],
                    ["Lemonade", "Fresh homemade lemonade", 60000],
                    ["Mineral Water", "Cold mineral water", 25000]
                ]
            }

        ]

    ];


    // =================================================
    // CREATE RESTAURANTS
    // =================================================

    const restaurants = [];

    for (let i = 0; i < restaurantsData.length; i++) {

        const data = restaurantsData[i];

        const manager = managers[i];

        const restaurant =
            await prisma.restaurant.upsert({

                where: {
                    slug: data.slug
                },

                update: {

                    name: data.name,
                    description: data.description,
                    phone: data.phone,
                    address: data.address,
                    minimumOrder: data.minimumOrder,
                    deliveryFee: data.deliveryFee,
                    managerId: manager.id

                },

                create: {

                    name: data.name,
                    slug: data.slug,
                    description: data.description,
                    phone: data.phone,
                    address: data.address,
                    minimumOrder: data.minimumOrder,
                    deliveryFee: data.deliveryFee,
                    managerId: manager.id

                }

            });

        restaurants.push(restaurant);

    }

    console.log("✅ 10 restaurants ready.");


    // =================================================
    // CREATE CATEGORIES AND FOODS
    // =================================================

    let totalCategories = 0;
    let totalFoods = 0;

    for (let i = 0; i < restaurants.length; i++) {

        const restaurant =
            restaurants[i];

        const menu =
            restaurantMenus[i];

        for (
            let categoryIndex = 0;
            categoryIndex < menu.length;
            categoryIndex++
        ) {

            const categoryData =
                menu[categoryIndex];

            const category =
                await prisma.category.upsert({

                    where: {

                        restaurantId_name: {

                            restaurantId:
                                restaurant.id,

                            name:
                                categoryData.name

                        }

                    },

                    update: {

                        description:
                            `${categoryData.name} menu`,

                        displayOrder:
                            categoryIndex + 1,

                        isActive:
                            true

                    },

                    create: {

                        name:
                            categoryData.name,

                        description:
                            `${categoryData.name} menu`,

                        displayOrder:
                            categoryIndex + 1,

                        restaurantId:
                            restaurant.id

                    }

                });

            totalCategories++;


            // =========================================
            // FOODS
            // =========================================

            for (
                let foodIndex = 0;
                foodIndex < categoryData.foods.length;
                foodIndex++
            ) {

                const [
                    name,
                    description,
                    price
                ] =
                    categoryData.foods[foodIndex];

                const existingFood =
                    await prisma.food.findFirst({

                        where: {

                            restaurantId:
                                restaurant.id,

                            categoryId:
                                category.id,

                            name

                        }

                    });

                if (existingFood) {

                    await prisma.food.update({

                        where: {
                            id: existingFood.id
                        },

                        data: {

                            description,
                            price,

                            displayOrder:
                                foodIndex + 1,

                            isActive:
                                true,

                            isAvailable:
                                true

                        }

                    });

                }
                else {

                    await prisma.food.create({

                        data: {

                            name,
                            description,
                            price,

                            restaurantId:
                                restaurant.id,

                            categoryId:
                                category.id,

                            displayOrder:
                                foodIndex + 1

                        }

                    });

                }

                totalFoods++;

            }

        }

    }


    console.log("✅ Categories and foods seeded.");

    console.log("");
    console.log("🎉 Seed completed successfully!");
    console.log("");

    console.log("Users:");
    console.log("  👑 1 System Admin");
    console.log("  👤 50 Customers");
    console.log("  🛵 1 Driver");
    console.log("  👨‍🍳 10 Restaurant Managers");
    console.log("  👥 Total Users: 62");

    console.log("");

    console.log("Restaurants: 10");
    console.log(`Categories: ${totalCategories}`);
    console.log(`Foods: ${totalFoods}`);

}


// =====================================================
// RUN SEED
// =====================================================

main()

    .catch((error) => {

        console.error(error);

        process.exit(1);

    })

    .finally(async () => {

        await prisma.$disconnect();

    });