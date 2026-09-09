/*
برای اجرا اول سرچ کن
ORDERS + ORDER ITEMS
و کد ثبت سفارشات رو از کامنت دربیار
اگر این قسمت کد دوبار اجرا بشه دیتای تکراری وارد دیتابیس میشه! 
همچنین برای قسمت REVIEWS این کارو تکرار کن
*/

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

                            restaurantId: restaurant.id,

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

                            categoryId: category.id,

                            displayOrder:
                                foodIndex + 1,

                            isActive: true,

                            isAvailable: true

                        }

                    });

                    console.log(
                        `↻ Food updated: ${name} (${restaurant.name})`
                    );

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
                                foodIndex + 1,

                            isActive: true,

                            isAvailable: true

                        }

                    });

                    console.log(
                        `✅ Food created: ${name} (${restaurant.name})`
                    );

                }






                totalFoods++;

            }

        }

    }


    console.log("✅ Categories and foods seeded.");

    /*
        // // =====================================================
        // // ORDERS + ORDER ITEMS
        // // =====================================================
    
        // console.log("🛒 Creating 300 manual orders...");
    
    
        // // -----------------------------------------------------
        // // 300 MANUAL ORDERS
        // // هر Customer دقیقاً 6 سفارش دارد.
        // // ترکیب غذاها به‌صورت دستی و منطقی انتخاب شده است.
        // // -----------------------------------------------------
    
        // const orderData = [
    
        //     // =================================================
        //     // CUSTOMER 1
        //     // =================================================
    
        //     { customer: 1, restaurant: "pizza-house", items: [["Pepperoni Pizza", 1], ["Garlic Bread", 1], ["Coca Cola", 1]], status: "DELIVERED" },
        //     { customer: 1, restaurant: "burger-land", items: [["Double Burger", 1], ["Loaded Fries", 1], ["Cola", 1]], status: "DELIVERED" },
        //     { customer: 1, restaurant: "iranian-taste", items: [["Fesenjan", 1], ["Shirazi Salad", 1], ["Saffron Drink", 1]], status: "DELIVERED" },
        //     { customer: 1, restaurant: "tehran-fast-food", items: [["Hot Dog", 1], ["Spicy Fries", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 1, restaurant: "pasta-garden", items: [["Spaghetti Carbonara", 1], ["Caesar Salad", 1], ["Iced Tea", 1]], status: "ACCEPTED" },
        //     { customer: 1, restaurant: "sandwich-house", items: [["Steak Sandwich", 1], ["Greek Salad", 1], ["Orange Soda", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 2
        //     // =================================================
    
        //     { customer: 2, restaurant: "burger-land", items: [["Double Burger", 1], ["Loaded Fries", 1], ["Cola", 1]], status: "DELIVERED" },
        //     { customer: 2, restaurant: "iranian-taste", items: [["Fesenjan", 1], ["Shirazi Salad", 1], ["Saffron Drink", 1]], status: "DELIVERED" },
        //     { customer: 2, restaurant: "tehran-fast-food", items: [["Hot Dog", 1], ["Spicy Fries", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 2, restaurant: "pasta-garden", items: [["Spaghetti Carbonara", 1], ["Caesar Salad", 1], ["Iced Tea", 1]], status: "DELIVERED" },
        //     { customer: 2, restaurant: "sandwich-house", items: [["Steak Sandwich", 1], ["Greek Salad", 1], ["Orange Soda", 1]], status: "ACCEPTED" },
        //     { customer: 2, restaurant: "pizza-corner", items: [["Pepperoni Pizza", 1], ["French Fries", 1], ["Pepsi", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 3
        //     // =================================================
    
        //     { customer: 3, restaurant: "iranian-taste", items: [["Fesenjan", 1], ["Shirazi Salad", 1], ["Saffron Drink", 1]], status: "DELIVERED" },
        //     { customer: 3, restaurant: "tehran-fast-food", items: [["Hot Dog", 1], ["Spicy Fries", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 3, restaurant: "pasta-garden", items: [["Spaghetti Carbonara", 1], ["Caesar Salad", 1], ["Iced Tea", 1]], status: "DELIVERED" },
        //     { customer: 3, restaurant: "sandwich-house", items: [["Steak Sandwich", 1], ["Greek Salad", 1], ["Orange Soda", 1]], status: "DELIVERED" },
        //     { customer: 3, restaurant: "pizza-corner", items: [["Pepperoni Pizza", 1], ["French Fries", 1], ["Pepsi", 1]], status: "ACCEPTED" },
        //     { customer: 3, restaurant: "crispy-chicken", items: [["Spicy Chicken", 1], ["Cheese Fries", 1], ["Pepsi", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 4
        //     // =================================================
    
        //     { customer: 4, restaurant: "tehran-fast-food", items: [["Hot Dog", 1], ["Spicy Fries", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 4, restaurant: "pasta-garden", items: [["Spaghetti Carbonara", 1], ["Caesar Salad", 1], ["Iced Tea", 1]], status: "DELIVERED" },
        //     { customer: 4, restaurant: "sandwich-house", items: [["Steak Sandwich", 1], ["Greek Salad", 1], ["Orange Soda", 1]], status: "DELIVERED" },
        //     { customer: 4, restaurant: "pizza-corner", items: [["Pepperoni Pizza", 1], ["French Fries", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 4, restaurant: "crispy-chicken", items: [["Spicy Chicken", 1], ["Cheese Fries", 1], ["Pepsi", 1]], status: "ACCEPTED" },
        //     { customer: 4, restaurant: "potato-and-drink", items: [["Garlic Fries", 1], ["Chicken Wings", 1], ["Pepsi", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 5
        //     // =================================================
    
        //     { customer: 5, restaurant: "pasta-garden", items: [["Spaghetti Carbonara", 1], ["Caesar Salad", 1], ["Iced Tea", 1]], status: "DELIVERED" },
        //     { customer: 5, restaurant: "sandwich-house", items: [["Steak Sandwich", 1], ["Greek Salad", 1], ["Orange Soda", 1]], status: "DELIVERED" },
        //     { customer: 5, restaurant: "pizza-corner", items: [["Pepperoni Pizza", 1], ["French Fries", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 5, restaurant: "crispy-chicken", items: [["Spicy Chicken", 1], ["Cheese Fries", 1], ["Pepsi", 1]], status: "CANCELLED" },
        //     { customer: 5, restaurant: "potato-and-drink", items: [["Garlic Fries", 1], ["Chicken Wings", 1], ["Pepsi", 1]], status: "READY_FOR_PICKUP" },
        //     { customer: 5, restaurant: "persian-kitchen", items: [["Tahchin", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "ACCEPTED" },
    
        //     // =================================================
        //     // CUSTOMER 6
        //     // =================================================
    
        //     { customer: 6, restaurant: "sandwich-house", items: [["Steak Sandwich", 1], ["Greek Salad", 1], ["Orange Soda", 1]], status: "DELIVERED" },
        //     { customer: 6, restaurant: "pizza-corner", items: [["Pepperoni Pizza", 1], ["French Fries", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 6, restaurant: "crispy-chicken", items: [["Spicy Chicken", 1], ["Cheese Fries", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 6, restaurant: "potato-and-drink", items: [["Garlic Fries", 1], ["Chicken Wings", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 6, restaurant: "persian-kitchen", items: [["Tahchin", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "ACCEPTED" },
        //     { customer: 6, restaurant: "pizza-house", items: [["Vegetable Pizza", 1], ["Garlic Bread", 1], ["Doogh", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 7
        //     // =================================================
    
        //     { customer: 7, restaurant: "pizza-corner", items: [["Pepperoni Pizza", 1], ["French Fries", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 7, restaurant: "crispy-chicken", items: [["Spicy Chicken", 1], ["Cheese Fries", 1], ["Pepsi", 1]], status: "CANCELLED" },
        //     { customer: 7, restaurant: "potato-and-drink", items: [["Garlic Fries", 1], ["Chicken Wings", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 7, restaurant: "persian-kitchen", items: [["Tahchin", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "PICKED_UP" },
        //     { customer: 7, restaurant: "pizza-house", items: [["Vegetable Pizza", 1], ["Garlic Bread", 1], ["Doogh", 1]], status: "PREPARING" },
        //     { customer: 7, restaurant: "burger-land", items: [["Classic Burger", 1], ["Spicy Fries", 1], ["Pepsi", 1]], status: "ACCEPTED" },
    
        //     // =================================================
        //     // CUSTOMER 8
        //     // =================================================
    
        //     { customer: 8, restaurant: "crispy-chicken", items: [["Spicy Chicken", 1], ["Cheese Fries", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 8, restaurant: "potato-and-drink", items: [["Garlic Fries", 1], ["Chicken Wings", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 8, restaurant: "persian-kitchen", items: [["Tahchin", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "DELIVERED" },
        //     { customer: 8, restaurant: "pizza-house", items: [["Vegetable Pizza", 1], ["Garlic Bread", 1], ["Doogh", 1]], status: "DELIVERED" },
        //     { customer: 8, restaurant: "burger-land", items: [["Classic Burger", 1], ["Spicy Fries", 1], ["Pepsi", 1]], status: "ACCEPTED" },
        //     { customer: 8, restaurant: "iranian-taste", items: [["Ghormeh Sabzi", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 9
        //     // =================================================
    
        //     { customer: 9, restaurant: "potato-and-drink", items: [["Garlic Fries", 1], ["Chicken Wings", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 9, restaurant: "persian-kitchen", items: [["Tahchin", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "DELIVERED" },
        //     { customer: 9, restaurant: "pizza-house", items: [["Vegetable Pizza", 1], ["Garlic Bread", 1], ["Doogh", 1]], status: "DELIVERED" },
        //     { customer: 9, restaurant: "burger-land", items: [["Classic Burger", 1], ["Spicy Fries", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 9, restaurant: "iranian-taste", items: [["Ghormeh Sabzi", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "ACCEPTED" },
        //     { customer: 9, restaurant: "tehran-fast-food", items: [["Chicken Burger", 1], ["French Fries", 1], ["Sprite", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 10
        //     // =================================================
    
        //     { customer: 10, restaurant: "persian-kitchen", items: [["Tahchin", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "DELIVERED" },
        //     { customer: 10, restaurant: "pizza-house", items: [["Vegetable Pizza", 1], ["Garlic Bread", 1], ["Doogh", 1]], status: "DELIVERED" },
        //     { customer: 10, restaurant: "burger-land", items: [["Classic Burger", 1], ["Spicy Fries", 1], ["Pepsi", 1]], status: "CANCELLED" },
        //     { customer: 10, restaurant: "iranian-taste", items: [["Ghormeh Sabzi", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "DELIVERED" },
        //     { customer: 10, restaurant: "tehran-fast-food", items: [["Chicken Burger", 1], ["French Fries", 1], ["Sprite", 1]], status: "READY_FOR_PICKUP" },
        //     { customer: 10, restaurant: "pasta-garden", items: [["Penne Alfredo", 1], ["Garden Salad", 1], ["Lemonade", 1]], status: "PENDING" },
    
        //     // =================================================
        //     // CUSTOMER 11
        //     // =================================================
    
        //     { customer: 11, restaurant: "pizza-house", items: [["Special Pizza", 1], ["Mozzarella Sticks", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 11, restaurant: "burger-land", items: [["BBQ Burger", 1], ["Classic Fries", 1], ["Cola", 1]], status: "DELIVERED" },
        //     { customer: 11, restaurant: "iranian-taste", items: [["Joojeh Kebab", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "DELIVERED" },
        //     { customer: 11, restaurant: "pasta-garden", items: [["Chicken Alfredo", 1], ["Caesar Salad", 1], ["Lemonade", 1]], status: "DELIVERED" },
        //     { customer: 11, restaurant: "sandwich-house", items: [["Club Sandwich", 1], ["Chicken Nuggets", 1], ["Pepsi", 1]], status: "ACCEPTED" },
        //     { customer: 11, restaurant: "crispy-chicken", items: [["Chicken Combo", 1], ["French Fries", 1], ["Sprite", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 12
        //     // =================================================
    
        //     { customer: 12, restaurant: "burger-land", items: [["Classic Burger", 1], ["Classic Fries", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 12, restaurant: "iranian-taste", items: [["Kebab Koobideh", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "DELIVERED" },
        //     { customer: 12, restaurant: "pasta-garden", items: [["Spaghetti Bolognese", 1], ["Garlic Bread", 1], ["Iced Tea", 1]], status: "DELIVERED" },
        //     { customer: 12, restaurant: "sandwich-house", items: [["Chicken Sandwich", 1], ["Classic Fries", 1], ["Cola", 1]], status: "DELIVERED" },
        //     { customer: 12, restaurant: "crispy-chicken", items: [["Chicken Burger", 1], ["French Fries", 1], ["Sprite", 1]], status: "ACCEPTED" },
        //     { customer: 12, restaurant: "pizza-corner", items: [["Four Cheese Pizza", 1], ["Garlic Bread", 1], ["Coca Cola", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 13
        //     // =================================================
    
        //     { customer: 13, restaurant: "pasta-garden", items: [["Penne Alfredo", 1], ["Greek Salad", 1], ["Lemonade", 1]], status: "DELIVERED" },
        //     { customer: 13, restaurant: "sandwich-house", items: [["Club Sandwich", 1], ["Chicken Nuggets", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 13, restaurant: "crispy-chicken", items: [["Chicken Box", 1], ["Cola", 1], ["Mineral Water", 1]], status: "DELIVERED" },
        //     { customer: 13, restaurant: "pizza-corner", items: [["Meat Lovers Pizza", 1], ["Chicken Wings", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 13, restaurant: "pizza-house", items: [["Margherita Pizza", 1], ["Garlic Bread", 1], ["Coca Cola", 1]], status: "ACCEPTED" },
        //     { customer: 13, restaurant: "burger-land", items: [["Mushroom Burger", 1], ["Potato Wedges", 1], ["Doogh", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 14
        //     // =================================================
    
        //     { customer: 14, restaurant: "iranian-taste", items: [["Chelo Kebab", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "DELIVERED" },
        //     { customer: 14, restaurant: "tehran-fast-food", items: [["Beef Sandwich", 1], ["French Fries", 1], ["Cola", 1]], status: "DELIVERED" },
        //     { customer: 14, restaurant: "sandwich-house", items: [["Steak Sandwich", 1], ["Onion Rings", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 14, restaurant: "pizza-corner", items: [["Persian Special Pizza", 1], ["Garlic Bread", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 14, restaurant: "crispy-chicken", items: [["Spicy Chicken Combo", 1], ["Loaded Fries", 1], ["Orange Soda", 1]], status: "ACCEPTED" },
        //     { customer: 14, restaurant: "potato-and-drink", items: [["Cheese Fries", 1], ["Chicken Strips", 1], ["Lemonade", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 15
        //     // =================================================
    
        //     { customer: 15, restaurant: "tehran-fast-food", items: [["Beef Sandwich", 1], ["French Fries", 1], ["Cola", 1]], status: "DELIVERED" },
        //     { customer: 15, restaurant: "sandwich-house", items: [["Steak Sandwich", 1], ["Onion Rings", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 15, restaurant: "pizza-corner", items: [["BBQ Chicken Pizza", 1], ["Onion Rings", 1], ["Coca Cola", 1]], status: "DELIVERED" },
        //     { customer: 15, restaurant: "crispy-chicken", items: [["Crispy Chicken", 1], ["French Fries", 1], ["Cola", 1]], status: "CANCELLED" },
        //     { customer: 15, restaurant: "potato-and-drink", items: [["Chicken Combo", 1], ["Cheese Sauce", 1], ["Orange Soda", 1]], status: "READY_FOR_PICKUP" },
        //     { customer: 15, restaurant: "persian-kitchen", items: [["Joojeh Kebab", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "ACCEPTED" },
    
        //     // =================================================
        //     // CUSTOMER 16
        //     // =================================================
    
        //     { customer: 16, restaurant: "sandwich-house", items: [["Chicken Sandwich", 1], ["Classic Fries", 1], ["Cola", 1]], status: "DELIVERED" },
        //     { customer: 16, restaurant: "pizza-corner", items: [["Four Cheese Pizza", 1], ["Garlic Bread", 1], ["Coca Cola", 1]], status: "DELIVERED" },
        //     { customer: 16, restaurant: "crispy-chicken", items: [["Chicken Combo", 1], ["French Fries", 1], ["Sprite", 1]], status: "DELIVERED" },
        //     { customer: 16, restaurant: "potato-and-drink", items: [["Special Fries", 1], ["Chicken Nuggets", 1], ["Cola", 1]], status: "DELIVERED" },
        //     { customer: 16, restaurant: "persian-kitchen", items: [["Ghormeh Sabzi", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "ACCEPTED" },
        //     { customer: 16, restaurant: "pizza-house", items: [["Pepperoni Pizza", 1], ["Chicken Wings", 1], ["Pepsi", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 17
        //     // =================================================
    
        //     { customer: 17, restaurant: "pizza-corner", items: [["Meat Lovers Pizza", 1], ["Chicken Wings", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 17, restaurant: "crispy-chicken", items: [["Chicken Box", 1], ["Cola", 1], ["Mineral Water", 1]], status: "DELIVERED" },
        //     { customer: 17, restaurant: "potato-and-drink", items: [["Spicy Fries", 1], ["Chicken Bites", 1], ["Lemonade", 1]], status: "DELIVERED" },
        //     { customer: 17, restaurant: "persian-kitchen", items: [["Zereshk Polo", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "DELIVERED" },
        //     { customer: 17, restaurant: "pizza-house", items: [["Special Pizza", 1], ["Mozzarella Sticks", 1], ["Pepsi", 1]], status: "ACCEPTED" },
        //     { customer: 17, restaurant: "burger-land", items: [["BBQ Burger", 1], ["Classic Fries", 1], ["Cola", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 18
        //     // =================================================
    
        //     { customer: 18, restaurant: "crispy-chicken", items: [["Crispy Chicken", 1], ["French Fries", 1], ["Cola", 1]], status: "DELIVERED" },
        //     { customer: 18, restaurant: "potato-and-drink", items: [["Cheese Fries", 1], ["Chicken Strips", 1], ["Lemonade", 1]], status: "DELIVERED" },
        //     { customer: 18, restaurant: "persian-kitchen", items: [["Kebab Koobideh", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "DELIVERED" },
        //     { customer: 18, restaurant: "pizza-house", items: [["Chicken Pizza", 1], ["Cheese Fries", 1], ["Orange Soda", 1]], status: "DELIVERED" },
        //     { customer: 18, restaurant: "burger-land", items: [["Chicken Burger", 1], ["Cheese Fries", 1], ["Sprite", 1]], status: "ACCEPTED" },
        //     { customer: 18, restaurant: "iranian-taste", items: [["Fesenjan", 1], ["Mast Khiar", 1], ["Saffron Drink", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 19
        //     // =================================================
    
        //     { customer: 19, restaurant: "potato-and-drink", items: [["Special Fries", 1], ["Chicken Nuggets", 1], ["Cola", 1]], status: "DELIVERED" },
        //     { customer: 19, restaurant: "persian-kitchen", items: [["Fesenjan", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "DELIVERED" },
        //     { customer: 19, restaurant: "pizza-house", items: [["Margherita Pizza", 1], ["Garlic Bread", 1], ["Coca Cola", 1]], status: "DELIVERED" },
        //     { customer: 19, restaurant: "burger-land", items: [["Cheese Burger", 1], ["Classic Fries", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 19, restaurant: "iranian-taste", items: [["Baghali Polo", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "ACCEPTED" },
        //     { customer: 19, restaurant: "tehran-fast-food", items: [["Special Burger", 1], ["Loaded Fries", 1], ["Orange Soda", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 20
        //     // =================================================
    
        //     { customer: 20, restaurant: "persian-kitchen", items: [["Zereshk Polo", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "DELIVERED" },
        //     { customer: 20, restaurant: "pizza-house", items: [["Pepperoni Pizza", 1], ["Garlic Bread", 1], ["Coca Cola", 1]], status: "DELIVERED" },
        //     { customer: 20, restaurant: "burger-land", items: [["Mushroom Burger", 1], ["Potato Wedges", 1], ["Doogh", 1]], status: "CANCELLED" },
        //     { customer: 20, restaurant: "iranian-taste", items: [["Chelo Kebab", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "DELIVERED" },
        //     { customer: 20, restaurant: "tehran-fast-food", items: [["Chicken Cheese Sandwich", 1], ["Cheese Fries", 1], ["Sprite", 1]], status: "READY_FOR_PICKUP" },
        //     { customer: 20, restaurant: "pasta-garden", items: [["Lasagna", 1], ["Greek Salad", 1], ["Orange Soda", 1]], status: "PENDING" },
    
        //     // =================================================
        //     // CUSTOMER 21
        //     // =================================================
    
        //     { customer: 21, restaurant: "pizza-corner", items: [["Meat Lovers Pizza", 1], ["Chicken Wings", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 21, restaurant: "crispy-chicken", items: [["Spicy Chicken Combo", 1], ["Loaded Fries", 1], ["Orange Soda", 1]], status: "DELIVERED" },
        //     { customer: 21, restaurant: "potato-and-drink", items: [["Chicken Combo", 1], ["Cheese Sauce", 1], ["Orange Soda", 1]], status: "DELIVERED" },
        //     { customer: 21, restaurant: "persian-kitchen", items: [["Tahchin", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "PICKED_UP" },
        //     { customer: 21, restaurant: "pizza-house", items: [["Special Pizza", 1], ["Chicken Wings", 1], ["Pepsi", 1]], status: "PREPARING" },
        //     { customer: 21, restaurant: "burger-land", items: [["Double Burger", 1], ["Loaded Fries", 1], ["Cola", 1]], status: "ACCEPTED" },
    
        //     // =================================================
        //     // CUSTOMER 22
        //     // =================================================
    
        //     { customer: 22, restaurant: "crispy-chicken", items: [["Chicken Combo", 1], ["French Fries", 1], ["Sprite", 1]], status: "DELIVERED" },
        //     { customer: 22, restaurant: "potato-and-drink", items: [["Chicken Combo", 1], ["Cheese Sauce", 1], ["Orange Soda", 1]], status: "DELIVERED" },
        //     { customer: 22, restaurant: "persian-kitchen", items: [["Joojeh Kebab", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "DELIVERED" },
        //     { customer: 22, restaurant: "pizza-house", items: [["Chicken Pizza", 1], ["Cheese Fries", 1], ["Orange Soda", 1]], status: "DELIVERED" },
        //     { customer: 22, restaurant: "burger-land", items: [["BBQ Burger", 1], ["Classic Fries", 1], ["Cola", 1]], status: "ACCEPTED" },
        //     { customer: 22, restaurant: "iranian-taste", items: [["Gheymeh", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 23
        //     // =================================================
    
        //     { customer: 23, restaurant: "sandwich-house", items: [["Club Sandwich", 1], ["Classic Fries", 1], ["Cola", 1]], status: "DELIVERED" },
        //     { customer: 23, restaurant: "pizza-corner", items: [["Chicken Pizza", 1], ["Cheese Fries", 1], ["Sprite", 1]], status: "DELIVERED" },
        //     { customer: 23, restaurant: "crispy-chicken", items: [["Chicken Burger", 1], ["Potato Wedges", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 23, restaurant: "potato-and-drink", items: [["Cheese Fries", 1], ["Chicken Strips", 1], ["Lemonade", 1]], status: "DELIVERED" },
        //     { customer: 23, restaurant: "persian-kitchen", items: [["Ghormeh Sabzi", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "ACCEPTED" },
        //     { customer: 23, restaurant: "pizza-house", items: [["Margherita Pizza", 1], ["Garlic Bread", 1], ["Coca Cola", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 24
        //     // =================================================
    
        //     { customer: 24, restaurant: "tehran-fast-food", items: [["Cheese Burger", 1], ["Cheese Fries", 1], ["Sprite", 1]], status: "DELIVERED" },
        //     { customer: 24, restaurant: "pasta-garden", items: [["Chicken Parmesan", 1], ["Garden Salad", 1], ["Orange Soda", 1]], status: "DELIVERED" },
        //     { customer: 24, restaurant: "sandwich-house", items: [["Chicken Cheese Sandwich", 1], ["Onion Rings", 1], ["Doogh", 1]], status: "DELIVERED" },
        //     { customer: 24, restaurant: "pizza-corner", items: [["BBQ Chicken Pizza", 1], ["Garlic Bread", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 24, restaurant: "crispy-chicken", items: [["Spicy Chicken", 1], ["Cheese Fries", 1], ["Pepsi", 1]], status: "ACCEPTED" },
        //     { customer: 24, restaurant: "iranian-taste", items: [["Kebab Koobideh", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 25
        //     // =================================================
    
        //     { customer: 25, restaurant: "potato-and-drink", items: [["Classic Fries", 1], ["Mozzarella Sticks", 1], ["Cola", 1]], status: "DELIVERED" },
        //     { customer: 25, restaurant: "persian-kitchen", items: [["Baghali Polo", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "DELIVERED" },
        //     { customer: 25, restaurant: "pizza-house", items: [["Pepperoni Pizza", 1], ["French Fries", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 25, restaurant: "burger-land", items: [["Cheese Burger", 1], ["Classic Fries", 1], ["Pepsi", 1]], status: "CANCELLED" },
        //     { customer: 25, restaurant: "iranian-taste", items: [["Fesenjan", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "READY_FOR_PICKUP" },
        //     { customer: 25, restaurant: "pasta-garden", items: [["Spaghetti Bolognese", 1], ["Garlic Bread", 1], ["Iced Tea", 1]], status: "ACCEPTED" },
    
        //     // =================================================
        //     // CUSTOMER 26
        //     // =================================================
    
        //     { customer: 26, restaurant: "burger-land", items: [["Cheese Burger", 1], ["Classic Fries", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 26, restaurant: "tehran-fast-food", items: [["Mushroom Burger", 1], ["Spicy Fries", 1], ["Sprite", 1]], status: "DELIVERED" },
        //     { customer: 26, restaurant: "pasta-garden", items: [["Chicken Alfredo", 1], ["Caesar Salad", 1], ["Lemonade", 1]], status: "DELIVERED" },
        //     { customer: 26, restaurant: "sandwich-house", items: [["Roast Beef Sandwich", 1], ["Mozzarella Sticks", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 26, restaurant: "pizza-corner", items: [["Four Cheese Pizza", 1], ["Garlic Bread", 1], ["Coca Cola", 1]], status: "ACCEPTED" },
        //     { customer: 26, restaurant: "crispy-chicken", items: [["Chicken Box", 1], ["Cola", 1], ["Mineral Water", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 27
        //     // =================================================
    
        //     { customer: 27, restaurant: "iranian-taste", items: [["Gheymeh", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "DELIVERED" },
        //     { customer: 27, restaurant: "persian-kitchen", items: [["Adas Polo", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "DELIVERED" },
        //     { customer: 27, restaurant: "pizza-house", items: [["Chicken Pizza", 1], ["Cheese Fries", 1], ["Orange Soda", 1]], status: "DELIVERED" },
        //     { customer: 27, restaurant: "burger-land", items: [["Mushroom Burger", 1], ["Potato Wedges", 1], ["Doogh", 1]], status: "PICKED_UP" },
        //     { customer: 27, restaurant: "pasta-garden", items: [["Lasagna", 1], ["Garlic Bread", 1], ["Iced Tea", 1]], status: "PREPARING" },
        //     { customer: 27, restaurant: "sandwich-house", items: [["Tuna Sandwich", 1], ["Classic Fries", 1], ["Pepsi", 1]], status: "ACCEPTED" },
    
        //     // =================================================
        //     // CUSTOMER 28
        //     // =================================================
    
        //     { customer: 28, restaurant: "pizza-house", items: [["Special Pizza", 1], ["Cheese Fries", 1], ["Coca Cola", 1]], status: "DELIVERED" },
        //     { customer: 28, restaurant: "pizza-corner", items: [["BBQ Chicken Pizza", 1], ["Garlic Bread", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 28, restaurant: "burger-land", items: [["Double Burger", 1], ["Loaded Fries", 1], ["Cola", 1]], status: "DELIVERED" },
        //     { customer: 28, restaurant: "iranian-taste", items: [["Joojeh Kebab", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "DELIVERED" },
        //     { customer: 28, restaurant: "tehran-fast-food", items: [["Steak Sandwich", 1], ["French Fries", 1], ["Cola", 1]], status: "ACCEPTED" },
        //     { customer: 28, restaurant: "pasta-garden", items: [["Penne Alfredo", 1], ["Garden Salad", 1], ["Lemonade", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 29
        //     // =================================================
    
        //     { customer: 29, restaurant: "crispy-chicken", items: [["Chicken Box", 1], ["Cola", 1], ["Mineral Water", 1]], status: "DELIVERED" },
        //     { customer: 29, restaurant: "potato-and-drink", items: [["Spicy Fries", 1], ["Chicken Bites", 1], ["Lemonade", 1]], status: "DELIVERED" },
        //     { customer: 29, restaurant: "persian-kitchen", items: [["Chelo Kebab", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "DELIVERED" },
        //     { customer: 29, restaurant: "pizza-house", items: [["Pepperoni Pizza", 1], ["Chicken Wings", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 29, restaurant: "burger-land", items: [["BBQ Burger", 1], ["Classic Fries", 1], ["Cola", 1]], status: "ACCEPTED" },
        //     { customer: 29, restaurant: "sandwich-house", items: [["Beef Sandwich", 1], ["Classic Fries", 1], ["Cola", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 30
        //     // =================================================
    
        //     { customer: 30, restaurant: "pasta-garden", items: [["Penne Arrabbiata", 1], ["Garden Salad", 1], ["Lemonade", 1]], status: "DELIVERED" },
        //     { customer: 30, restaurant: "sandwich-house", items: [["Chicken Cheese Sandwich", 1], ["Onion Rings", 1], ["Doogh", 1]], status: "DELIVERED" },
        //     { customer: 30, restaurant: "pizza-corner", items: [["Persian Special Pizza", 1], ["Garlic Bread", 1], ["Pepsi", 1]], status: "CANCELLED" },
        //     { customer: 30, restaurant: "crispy-chicken", items: [["Spicy Chicken Combo", 1], ["Loaded Fries", 1], ["Orange Soda", 1]], status: "DELIVERED" },
        //     { customer: 30, restaurant: "potato-and-drink", items: [["Garlic Fries", 1], ["Chicken Wings", 1], ["Pepsi", 1]], status: "READY_FOR_PICKUP" },
        //     { customer: 30, restaurant: "persian-kitchen", items: [["Tahchin", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "PENDING" },
    
        //     // =================================================
        //     // CUSTOMER 31
        //     // =================================================
    
        //     { customer: 31, restaurant: "sandwich-house", items: [["Tuna Sandwich", 1], ["Classic Fries", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 31, restaurant: "tehran-fast-food", items: [["Chicken Cheese Sandwich", 1], ["Cheese Fries", 1], ["Sprite", 1]], status: "DELIVERED" },
        //     { customer: 31, restaurant: "pizza-house", items: [["Margherita Pizza", 1], ["Garlic Bread", 1], ["Coca Cola", 1]], status: "DELIVERED" },
        //     { customer: 31, restaurant: "burger-land", items: [["Chicken Burger", 1], ["Cheese Fries", 1], ["Sprite", 1]], status: "DELIVERED" },
        //     { customer: 31, restaurant: "iranian-taste", items: [["Kebab Koobideh", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "ACCEPTED" },
        //     { customer: 31, restaurant: "pasta-garden", items: [["Chicken Parmesan", 1], ["Garden Salad", 1], ["Orange Soda", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 32
        //     // =================================================
    
        //     { customer: 32, restaurant: "burger-land", items: [["Double Burger", 1], ["Classic Fries", 1], ["Cola", 1]], status: "DELIVERED" },
        //     { customer: 32, restaurant: "tehran-fast-food", items: [["Mushroom Burger", 1], ["Spicy Fries", 1], ["Sprite", 1]], status: "DELIVERED" },
        //     { customer: 32, restaurant: "pasta-garden", items: [["Spaghetti Carbonara", 1], ["Caesar Salad", 1], ["Iced Tea", 1]], status: "DELIVERED" },
        //     { customer: 32, restaurant: "sandwich-house", items: [["Roast Beef Sandwich", 1], ["Mozzarella Sticks", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 32, restaurant: "pizza-corner", items: [["Meat Lovers Pizza", 1], ["Chicken Wings", 1], ["Pepsi", 1]], status: "ACCEPTED" },
        //     { customer: 32, restaurant: "crispy-chicken", items: [["Crispy Chicken", 1], ["French Fries", 1], ["Cola", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 33
        //     // =================================================
    
        //     { customer: 33, restaurant: "persian-kitchen", items: [["Chelo Kebab", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "DELIVERED" },
        //     { customer: 33, restaurant: "iranian-taste", items: [["Zereshk Polo", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "DELIVERED" },
        //     { customer: 33, restaurant: "pizza-house", items: [["Special Pizza", 1], ["Chicken Wings", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 33, restaurant: "burger-land", items: [["BBQ Burger", 1], ["Classic Fries", 1], ["Cola", 1]], status: "DELIVERED" },
        //     { customer: 33, restaurant: "tehran-fast-food", items: [["Beef Sandwich", 1], ["French Fries", 1], ["Cola", 1]], status: "ACCEPTED" },
        //     { customer: 33, restaurant: "pasta-garden", items: [["Lasagna", 1], ["Bruschetta", 1], ["Orange Soda", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 34
        //     // =================================================
    
        //     { customer: 34, restaurant: "pizza-house", items: [["Chicken Pizza", 1], ["Garlic Bread", 1], ["Coca Cola", 1]], status: "DELIVERED" },
        //     { customer: 34, restaurant: "pizza-corner", items: [["Four Cheese Pizza", 1], ["Garlic Bread", 1], ["Coca Cola", 1]], status: "DELIVERED" },
        //     { customer: 34, restaurant: "burger-land", items: [["Cheese Burger", 1], ["Classic Fries", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 34, restaurant: "iranian-taste", items: [["Joojeh Kebab", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "DELIVERED" },
        //     { customer: 34, restaurant: "tehran-fast-food", items: [["Chicken Sandwich", 1], ["French Fries", 1], ["Cola", 1]], status: "ACCEPTED" },
        //     { customer: 34, restaurant: "pasta-garden", items: [["Chicken Alfredo", 1], ["Caesar Salad", 1], ["Lemonade", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 35
        //     // =================================================
    
        //     { customer: 35, restaurant: "tehran-fast-food", items: [["Hot Dog", 1], ["French Fries", 1], ["Cola", 1]], status: "DELIVERED" },
        //     { customer: 35, restaurant: "sandwich-house", items: [["Hot Dog", 1], ["Cheese Fries", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 35, restaurant: "pizza-corner", items: [["Pepperoni Pizza", 1], ["Onion Rings", 1], ["Sprite", 1]], status: "DELIVERED" },
        //     { customer: 35, restaurant: "crispy-chicken", items: [["Chicken Combo", 1], ["French Fries", 1], ["Sprite", 1]], status: "CANCELLED" },
        //     { customer: 35, restaurant: "potato-and-drink", items: [["Special Fries", 1], ["Chicken Nuggets", 1], ["Cola", 1]], status: "READY_FOR_PICKUP" },
        //     { customer: 35, restaurant: "persian-kitchen", items: [["Kebab Koobideh", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "ACCEPTED" },
    
        //     // =================================================
        //     // CUSTOMER 36
        //     // =================================================
    
        //     { customer: 36, restaurant: "iranian-taste", items: [["Joojeh Kebab", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "DELIVERED" },
        //     { customer: 36, restaurant: "tehran-fast-food", items: [["Chicken Burger", 1], ["French Fries", 1], ["Sprite", 1]], status: "DELIVERED" },
        //     { customer: 36, restaurant: "pasta-garden", items: [["Penne Alfredo", 1], ["Garden Salad", 1], ["Lemonade", 1]], status: "DELIVERED" },
        //     { customer: 36, restaurant: "sandwich-house", items: [["Chicken Sandwich", 1], ["Classic Fries", 1], ["Cola", 1]], status: "DELIVERED" },
        //     { customer: 36, restaurant: "pizza-corner", items: [["Chicken Pizza", 1], ["Cheese Fries", 1], ["Sprite", 1]], status: "ACCEPTED" },
        //     { customer: 36, restaurant: "crispy-chicken", items: [["Chicken Strips", 1], ["Spicy Fries", 1], ["Cola", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 37
        //     // =================================================
    
        //     { customer: 37, restaurant: "pizza-corner", items: [["Persian Special Pizza", 1], ["Garlic Bread", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 37, restaurant: "crispy-chicken", items: [["Spicy Chicken", 1], ["Cheese Fries", 1], ["Pepsi", 1]], status: "CANCELLED" },
        //     { customer: 37, restaurant: "potato-and-drink", items: [["Garlic Fries", 1], ["Chicken Wings", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 37, restaurant: "persian-kitchen", items: [["Tahchin", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "PICKED_UP" },
        //     { customer: 37, restaurant: "pizza-house", items: [["Vegetable Pizza", 1], ["Garlic Bread", 1], ["Doogh", 1]], status: "PREPARING" },
        //     { customer: 37, restaurant: "burger-land", items: [["Classic Burger", 1], ["Spicy Fries", 1], ["Pepsi", 1]], status: "ACCEPTED" },
    
        //     // =================================================
        //     // CUSTOMER 38
        //     // =================================================
    
        //     { customer: 38, restaurant: "crispy-chicken", items: [["Chicken Combo", 1], ["Cola", 1], ["Mineral Water", 1]], status: "DELIVERED" },
        //     { customer: 38, restaurant: "potato-and-drink", items: [["Cheese Fries", 1], ["Chicken Strips", 1], ["Lemonade", 1]], status: "DELIVERED" },
        //     { customer: 38, restaurant: "persian-kitchen", items: [["Joojeh Kebab", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "DELIVERED" },
        //     { customer: 38, restaurant: "pizza-house", items: [["Pepperoni Pizza", 1], ["Chicken Wings", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 38, restaurant: "burger-land", items: [["Double Burger", 1], ["Loaded Fries", 1], ["Cola", 1]], status: "ACCEPTED" },
        //     { customer: 38, restaurant: "iranian-taste", items: [["Kebab Koobideh", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 39
        //     // =================================================
    
        //     { customer: 39, restaurant: "pasta-garden", items: [["Chicken Alfredo", 1], ["Caesar Salad", 1], ["Lemonade", 1]], status: "DELIVERED" },
        //     { customer: 39, restaurant: "sandwich-house", items: [["Roast Beef Sandwich", 1], ["Mozzarella Sticks", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 39, restaurant: "pizza-corner", items: [["Meat Lovers Pizza", 1], ["Chicken Wings", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 39, restaurant: "crispy-chicken", items: [["Chicken Box", 1], ["Cola", 1], ["Mineral Water", 1]], status: "DELIVERED" },
        //     { customer: 39, restaurant: "potato-and-drink", items: [["Special Fries", 1], ["Chicken Nuggets", 1], ["Cola", 1]], status: "ACCEPTED" },
        //     { customer: 39, restaurant: "persian-kitchen", items: [["Fesenjan", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 40
        //     // =================================================
    
        //     { customer: 40, restaurant: "burger-land", items: [["BBQ Burger", 1], ["Classic Fries", 1], ["Cola", 1]], status: "DELIVERED" },
        //     { customer: 40, restaurant: "tehran-fast-food", items: [["Steak Sandwich", 1], ["French Fries", 1], ["Sprite", 1]], status: "DELIVERED" },
        //     { customer: 40, restaurant: "pasta-garden", items: [["Spaghetti Carbonara", 1], ["Caesar Salad", 1], ["Iced Tea", 1]], status: "CANCELLED" },
        //     { customer: 40, restaurant: "iranian-taste", items: [["Chelo Kebab", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "DELIVERED" },
        //     { customer: 40, restaurant: "pizza-house", items: [["Special Pizza", 1], ["Chicken Wings", 1], ["Pepsi", 1]], status: "READY_FOR_PICKUP" },
        //     { customer: 40, restaurant: "sandwich-house", items: [["Club Sandwich", 1], ["Chicken Nuggets", 1], ["Pepsi", 1]], status: "PENDING" },
    
        //     // =================================================
        //     // CUSTOMER 41
        //     // =================================================
    
        //     { customer: 41, restaurant: "persian-kitchen", items: [["Ghormeh Sabzi", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "DELIVERED" },
        //     { customer: 41, restaurant: "pizza-house", items: [["Chicken Pizza", 1], ["Garlic Bread", 1], ["Coca Cola", 1]], status: "DELIVERED" },
        //     { customer: 41, restaurant: "burger-land", items: [["Cheese Burger", 1], ["Classic Fries", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 41, restaurant: "tehran-fast-food", items: [["Chicken Cheese Sandwich", 1], ["Cheese Fries", 1], ["Sprite", 1]], status: "DELIVERED" },
        //     { customer: 41, restaurant: "pasta-garden", items: [["Lasagna", 1], ["Garlic Bread", 1], ["Iced Tea", 1]], status: "ACCEPTED" },
        //     { customer: 41, restaurant: "sandwich-house", items: [["Chicken Sandwich", 1], ["Classic Fries", 1], ["Cola", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 42
        //     // =================================================
    
        //     { customer: 42, restaurant: "pizza-house", items: [["Vegetable Pizza", 1], ["Garlic Bread", 1], ["Coca Cola", 1]], status: "DELIVERED" },
        //     { customer: 42, restaurant: "burger-land", items: [["Double Burger", 1], ["Loaded Fries", 1], ["Cola", 1]], status: "DELIVERED" },
        //     { customer: 42, restaurant: "iranian-taste", items: [["Fesenjan", 1], ["Shirazi Salad", 1], ["Saffron Drink", 1]], status: "DELIVERED" },
        //     { customer: 42, restaurant: "pasta-garden", items: [["Chicken Alfredo", 1], ["Caesar Salad", 1], ["Lemonade", 1]], status: "DELIVERED" },
        //     { customer: 42, restaurant: "tehran-fast-food", items: [["Special Burger", 1], ["Loaded Fries", 1], ["Orange Soda", 1]], status: "ACCEPTED" },
        //     { customer: 42, restaurant: "pizza-corner", items: [["Four Cheese Pizza", 1], ["Garlic Bread", 1], ["Coca Cola", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 43
        //     // =================================================
    
        //     { customer: 43, restaurant: "sandwich-house", items: [["Beef Sandwich", 1], ["Classic Fries", 1], ["Cola", 1]], status: "DELIVERED" },
        //     { customer: 43, restaurant: "pizza-corner", items: [["Pepperoni Pizza", 1], ["Onion Rings", 1], ["Sprite", 1]], status: "DELIVERED" },
        //     { customer: 43, restaurant: "crispy-chicken", items: [["Crispy Chicken", 1], ["French Fries", 1], ["Cola", 1]], status: "DELIVERED" },
        //     { customer: 43, restaurant: "potato-and-drink", items: [["Spicy Fries", 1], ["Chicken Bites", 1], ["Lemonade", 1]], status: "DELIVERED" },
        //     { customer: 43, restaurant: "persian-kitchen", items: [["Kebab Koobideh", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "ACCEPTED" },
        //     { customer: 43, restaurant: "iranian-taste", items: [["Joojeh Kebab", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 44
        //     // =================================================
    
        //     { customer: 44, restaurant: "potato-and-drink", items: [["Cheese Fries", 1], ["Chicken Strips", 1], ["Cola", 1]], status: "DELIVERED" },
        //     { customer: 44, restaurant: "crispy-chicken", items: [["Chicken Burger", 1], ["Potato Wedges", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 44, restaurant: "persian-kitchen", items: [["Baghali Polo", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "DELIVERED" },
        //     { customer: 44, restaurant: "pizza-house", items: [["Pepperoni Pizza", 1], ["French Fries", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 44, restaurant: "burger-land", items: [["Mushroom Burger", 1], ["Potato Wedges", 1], ["Doogh", 1]], status: "ACCEPTED" },
        //     { customer: 44, restaurant: "tehran-fast-food", items: [["Chicken Burger", 1], ["French Fries", 1], ["Sprite", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 45
        //     // =================================================
    
        //     { customer: 45, restaurant: "iranian-taste", items: [["Fesenjan", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "DELIVERED" },
        //     { customer: 45, restaurant: "persian-kitchen", items: [["Baghali Polo", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "DELIVERED" },
        //     { customer: 45, restaurant: "pizza-corner", items: [["Meat Lovers Pizza", 1], ["Chicken Wings", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 45, restaurant: "pasta-garden", items: [["Chicken Parmesan", 1], ["Garden Salad", 1], ["Orange Soda", 1]], status: "CANCELLED" },
        //     { customer: 45, restaurant: "sandwich-house", items: [["Roast Beef Sandwich", 1], ["Mozzarella Sticks", 1], ["Pepsi", 1]], status: "READY_FOR_PICKUP" },
        //     { customer: 45, restaurant: "burger-land", items: [["Double Burger", 1], ["Loaded Fries", 1], ["Cola", 1]], status: "ACCEPTED" },
    
        //     // =================================================
        //     // CUSTOMER 46
        //     // =================================================
    
        //     { customer: 46, restaurant: "burger-land", items: [["Cheese Burger", 1], ["Classic Fries", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 46, restaurant: "tehran-fast-food", items: [["Mushroom Burger", 1], ["Spicy Fries", 1], ["Sprite", 1]], status: "DELIVERED" },
        //     { customer: 46, restaurant: "pasta-garden", items: [["Spaghetti Bolognese", 1], ["Garlic Bread", 1], ["Iced Tea", 1]], status: "DELIVERED" },
        //     { customer: 46, restaurant: "pizza-house", items: [["Special Pizza", 1], ["Mozzarella Sticks", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 46, restaurant: "iranian-taste", items: [["Kebab Koobideh", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "ACCEPTED" },
        //     { customer: 46, restaurant: "sandwich-house", items: [["Club Sandwich", 1], ["Chicken Nuggets", 1], ["Pepsi", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 47
        //     // =================================================
    
        //     { customer: 47, restaurant: "crispy-chicken", items: [["Crispy Chicken", 1], ["French Fries", 1], ["Cola", 1]], status: "DELIVERED" },
        //     { customer: 47, restaurant: "potato-and-drink", items: [["Special Fries", 1], ["Chicken Nuggets", 1], ["Cola", 1]], status: "DELIVERED" },
        //     { customer: 47, restaurant: "persian-kitchen", items: [["Joojeh Kebab", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "DELIVERED" },
        //     { customer: 47, restaurant: "pizza-corner", items: [["BBQ Chicken Pizza", 1], ["Garlic Bread", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 47, restaurant: "burger-land", items: [["Chicken Burger", 1], ["Cheese Fries", 1], ["Sprite", 1]], status: "ACCEPTED" },
        //     { customer: 47, restaurant: "iranian-taste", items: [["Chelo Kebab", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 48
        //     // =================================================
    
        //     { customer: 48, restaurant: "pizza-corner", items: [["Meat Lovers Pizza", 1], ["Garlic Bread", 1], ["Coca Cola", 1]], status: "DELIVERED" },
        //     { customer: 48, restaurant: "pizza-house", items: [["Cheese Fries", 1], ["Pepsi", 1]], status: "DELIVERED" },
        //     { customer: 48, restaurant: "burger-land", items: [["BBQ Burger", 1], ["Classic Fries", 1], ["Cola", 1]], status: "DELIVERED" },
        //     { customer: 48, restaurant: "pasta-garden", items: [["Spaghetti Carbonara", 1], ["Caesar Salad", 1], ["Iced Tea", 1]], status: "DELIVERED" },
        //     { customer: 48, restaurant: "crispy-chicken", items: [["Chicken Combo", 1], ["French Fries", 1], ["Sprite", 1]], status: "ACCEPTED" },
        //     { customer: 48, restaurant: "sandwich-house", items: [["Chicken Cheese Sandwich", 1], ["Onion Rings", 1], ["Doogh", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 49
        //     // =================================================
    
        //     { customer: 49, restaurant: "pasta-garden", items: [["Spaghetti Bolognese", 1], ["Caesar Salad", 1], ["Lemonade", 1]], status: "DELIVERED" },
        //     { customer: 49, restaurant: "sandwich-house", items: [["Chicken Cheese Sandwich", 1], ["Onion Rings", 1], ["Doogh", 1]], status: "DELIVERED" },
        //     { customer: 49, restaurant: "pizza-corner", items: [["Four Cheese Pizza", 1], ["Garlic Bread", 1], ["Coca Cola", 1]], status: "DELIVERED" },
        //     { customer: 49, restaurant: "crispy-chicken", items: [["Chicken Box", 1], ["Cola", 1], ["Mineral Water", 1]], status: "DELIVERED" },
        //     { customer: 49, restaurant: "potato-and-drink", items: [["Cheese Fries", 1], ["Chicken Strips", 1], ["Lemonade", 1]], status: "ACCEPTED" },
        //     { customer: 49, restaurant: "persian-kitchen", items: [["Fesenjan", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "PREPARING" },
    
        //     // =================================================
        //     // CUSTOMER 50
        //     // =================================================
    
        //     { customer: 50, restaurant: "iranian-taste", items: [["Kebab Koobideh", 1], ["Shirazi Salad", 1], ["Doogh", 1]], status: "DELIVERED" },
        //     { customer: 50, restaurant: "persian-kitchen", items: [["Tahchin", 1], ["Mast Khiar", 1], ["Mint Doogh", 1]], status: "DELIVERED" },
        //     { customer: 50, restaurant: "pizza-house", items: [["Pepperoni Pizza", 1], ["Garlic Bread", 1], ["Coca Cola", 1]], status: "DELIVERED" },
        //     { customer: 50, restaurant: "burger-land", items: [["Double Burger", 1], ["Loaded Fries", 1], ["Cola", 1]], status: "CANCELLED" },
        //     { customer: 50, restaurant: "pasta-garden", items: [["Chicken Parmesan", 1], ["Garden Salad", 1], ["Orange Soda", 1]], status: "READY_FOR_PICKUP" },
        //     { customer: 50, restaurant: "sandwich-house", items: [["Steak Sandwich", 1], ["Greek Salad", 1], ["Orange Soda", 1]], status: "ACCEPTED" }
    
        // ];
    
    
        // // =====================================================
        // // SAFETY CHECK
        // // =====================================================
    
        // if (orderData.length !== 300) {
        //     throw new Error(
        //         `Expected 300 manual orders, but found ${orderData.length}.`
        //     );
        // }
    
    
        // // =====================================================
        // // CREATE ORDERS
        // // =====================================================
    
        // let createdOrders = 0;
        // let createdOrderItems = 0;
    
        // for (const data of orderData) {
    
        //     // -------------------------------------------------
        //     // CUSTOMER
        //     // -------------------------------------------------
    
        //     const customer = customers[data.customer - 1];
    
        //     if (!customer) {
        //         throw new Error(
        //             `Customer ${data.customer} not found.`
        //         );
        //     }
    
    
        //     // -------------------------------------------------
        //     // DELIVERY ADDRESS
        //     // -------------------------------------------------
    
        //     const deliveryAddress =
        //         await prisma.deliveryAddress.findFirst({
    
        //             where: {
        //                 userId: customer.id
        //             }
    
        //         });
    
        //     if (!deliveryAddress) {
        //         throw new Error(
        //             `Delivery address not found for Customer ${data.customer}.`
        //         );
        //     }
    
    
        //     // -------------------------------------------------
        //     // RESTAURANT
        //     // -------------------------------------------------
    
        //     const restaurant =
        //         restaurants.find(
        //             r => r.slug === data.restaurant
        //         );
    
        //     if (!restaurant) {
        //         throw new Error(
        //             `Restaurant ${data.restaurant} not found.`
        //         );
        //     }
    
    
        //     // -------------------------------------------------
        //     // FIND FOODS
        //     // -------------------------------------------------
    
        //     const orderItemsData = [];
    
        //     let totalPrice = 0;
    
        //     for (const [foodName, quantity] of data.items) {
    
        //         const food =
        //             await prisma.food.findFirst({
    
        //                 where: {
    
        //                     restaurantId:
        //                         restaurant.id,
    
        //                     name:
        //                         foodName,
    
        //                     isActive: true,
    
        //                     isAvailable: true
    
        //                 }
    
        //             });
    
        //         if (!food) {
    
        //             throw new Error(
        //                 `Food "${foodName}" not found in ${restaurant.name}.`
        //             );
    
        //         }
    
    
        //         const unitPrice =
        //             Number(food.price);
    
        //         totalPrice +=
        //             unitPrice * quantity;
    
    
        //         orderItemsData.push({
    
        //             foodId:
        //                 food.id,
    
        //             quantity,
    
        //             unitPrice
    
        //         });
    
        //     }
    
    
        //     // -------------------------------------------------
        //     // CREATE ORDER
        //     // -------------------------------------------------
    
        //     const deliveryFee =
        //         Number(restaurant.deliveryFee);
    
        //     const finalPrice =
        //         totalPrice + deliveryFee;
    
    
        //     const order =
        //         await prisma.order.create({
    
        //             data: {
    
        //                 userId:
        //                     customer.id,
    
        //                 restaurantId:
        //                     restaurant.id,
    
        //                 deliveryAddressId:
        //                     deliveryAddress.id,
    
        //                 status:
        //                     data.status,
    
        //                 totalPrice,
    
        //                 deliveryFee,
    
        //                 finalPrice,
    
        //                 orderItems: {
    
        //                     create:
        //                         orderItemsData
    
        //                 }
    
        //             }
    
        //         });
    
    
        //     createdOrders++;
    
        //     createdOrderItems +=
        //         orderItemsData.length;
    
    
        //     console.log(
        //         `✅ Order ${createdOrders}/300 created - Customer ${data.customer} - ${restaurant.name}`
        //     );
    
        // }
    
    
        // console.log("");
    
        // console.log(
        //     `✅ ${createdOrders} orders created.`
        // );
    
        // console.log(
        //     `✅ ${createdOrderItems} order items created.`
        // );
    */


    /*
        // =====================================================
        // REVIEWS
        // =====================================================
    
        console.log("⭐ Creating manual reviews for delivered order items...");
    
    
        // =====================================================
        // GET DELIVERED ORDER ITEMS
        // =====================================================
    
        const deliveredOrderItems =
            await prisma.orderItem.findMany({
    
                where: {
    
                    order: {
    
                        status: "DELIVERED"
    
                    }
    
                },
    
                include: {
    
                    order: {
    
                        select: {
    
                            userId: true,
                            restaurantId: true
    
                        }
    
                    }
    
                },
    
                orderBy: {
    
                    order: {
    
                        createdAt: "asc"
    
                    }
    
                }
    
            });
    
    
        console.log(
            `📦 Delivered OrderItems available: ${deliveredOrderItems.length}`
        );
    
    
        // =====================================================
        // SAFETY CHECK
        // =====================================================
    
        if (deliveredOrderItems.length < 500) {
    
            throw new Error(
                `Not enough delivered order items. ` +
                `At least 500 are required, but only ` +
                `${deliveredOrderItems.length} were found.`
            );
    
        }
    
    
        // =====================================================
        // 500 MANUAL REVIEWS
        //
        // reviewIndex = position inside deliveredOrderItems
        //
        // 0-based:
        // 0 means first delivered OrderItem
        // 1 means second delivered OrderItem
        // ...
        //
        // 0-199  => Rating only
        // 200-499 => Rating + Comment
        // =====================================================
    
        const reviewData = [
    
            // =================================================
            // RATING ONLY
            // 200 REVIEWS
            // =================================================
    
            { reviewIndex: 0, rating: 5 },
            { reviewIndex: 1, rating: 5 },
            { reviewIndex: 2, rating: 4 },
            { reviewIndex: 3, rating: 5 },
            { reviewIndex: 4, rating: 4 },
            { reviewIndex: 5, rating: 5 },
            { reviewIndex: 6, rating: 5 },
            { reviewIndex: 7, rating: 4 },
            { reviewIndex: 8, rating: 3 },
            { reviewIndex: 9, rating: 5 },
    
            { reviewIndex: 10, rating: 5 },
            { reviewIndex: 11, rating: 4 },
            { reviewIndex: 12, rating: 5 },
            { reviewIndex: 13, rating: 4 },
            { reviewIndex: 14, rating: 3 },
            { reviewIndex: 15, rating: 5 },
            { reviewIndex: 16, rating: 4 },
            { reviewIndex: 17, rating: 5 },
            { reviewIndex: 18, rating: 5 },
            { reviewIndex: 19, rating: 4 },
    
            { reviewIndex: 20, rating: 5 },
            { reviewIndex: 21, rating: 4 },
            { reviewIndex: 22, rating: 3 },
            { reviewIndex: 23, rating: 5 },
            { reviewIndex: 24, rating: 4 },
            { reviewIndex: 25, rating: 5 },
            { reviewIndex: 26, rating: 5 },
            { reviewIndex: 27, rating: 4 },
            { reviewIndex: 28, rating: 5 },
            { reviewIndex: 29, rating: 3 },
    
            { reviewIndex: 30, rating: 5 },
            { reviewIndex: 31, rating: 4 },
            { reviewIndex: 32, rating: 5 },
            { reviewIndex: 33, rating: 4 },
            { reviewIndex: 34, rating: 5 },
            { reviewIndex: 35, rating: 5 },
            { reviewIndex: 36, rating: 3 },
            { reviewIndex: 37, rating: 4 },
            { reviewIndex: 38, rating: 5 },
            { reviewIndex: 39, rating: 4 },
    
            { reviewIndex: 40, rating: 5 },
            { reviewIndex: 41, rating: 5 },
            { reviewIndex: 42, rating: 4 },
            { reviewIndex: 43, rating: 3 },
            { reviewIndex: 44, rating: 5 },
            { reviewIndex: 45, rating: 4 },
            { reviewIndex: 46, rating: 5 },
            { reviewIndex: 47, rating: 4 },
            { reviewIndex: 48, rating: 5 },
            { reviewIndex: 49, rating: 5 },
    
            { reviewIndex: 50, rating: 4 },
            { reviewIndex: 51, rating: 5 },
            { reviewIndex: 52, rating: 5 },
            { reviewIndex: 53, rating: 3 },
            { reviewIndex: 54, rating: 4 },
            { reviewIndex: 55, rating: 5 },
            { reviewIndex: 56, rating: 4 },
            { reviewIndex: 57, rating: 5 },
            { reviewIndex: 58, rating: 5 },
            { reviewIndex: 59, rating: 4 },
    
            { reviewIndex: 60, rating: 5 },
            { reviewIndex: 61, rating: 4 },
            { reviewIndex: 62, rating: 5 },
            { reviewIndex: 63, rating: 3 },
            { reviewIndex: 64, rating: 5 },
            { reviewIndex: 65, rating: 4 },
            { reviewIndex: 66, rating: 5 },
            { reviewIndex: 67, rating: 4 },
            { reviewIndex: 68, rating: 5 },
            { reviewIndex: 69, rating: 5 },
    
            { reviewIndex: 70, rating: 4 },
            { reviewIndex: 71, rating: 5 },
            { reviewIndex: 72, rating: 3 },
            { reviewIndex: 73, rating: 4 },
            { reviewIndex: 74, rating: 5 },
            { reviewIndex: 75, rating: 5 },
            { reviewIndex: 76, rating: 4 },
            { reviewIndex: 77, rating: 5 },
            { reviewIndex: 78, rating: 4 },
            { reviewIndex: 79, rating: 5 },
    
            { reviewIndex: 80, rating: 5 },
            { reviewIndex: 81, rating: 4 },
            { reviewIndex: 82, rating: 3 },
            { reviewIndex: 83, rating: 5 },
            { reviewIndex: 84, rating: 4 },
            { reviewIndex: 85, rating: 5 },
            { reviewIndex: 86, rating: 5 },
            { reviewIndex: 87, rating: 4 },
            { reviewIndex: 88, rating: 5 },
            { reviewIndex: 89, rating: 3 },
    
            { reviewIndex: 90, rating: 5 },
            { reviewIndex: 91, rating: 4 },
            { reviewIndex: 92, rating: 5 },
            { reviewIndex: 93, rating: 5 },
            { reviewIndex: 94, rating: 4 },
            { reviewIndex: 95, rating: 3 },
            { reviewIndex: 96, rating: 5 },
            { reviewIndex: 97, rating: 4 },
            { reviewIndex: 98, rating: 5 },
            { reviewIndex: 99, rating: 5 },
    
            { reviewIndex: 100, rating: 4 },
            { reviewIndex: 101, rating: 5 },
            { reviewIndex: 102, rating: 5 },
            { reviewIndex: 103, rating: 4 },
            { reviewIndex: 104, rating: 3 },
            { reviewIndex: 105, rating: 5 },
            { reviewIndex: 106, rating: 4 },
            { reviewIndex: 107, rating: 5 },
            { reviewIndex: 108, rating: 5 },
            { reviewIndex: 109, rating: 4 },
    
            { reviewIndex: 110, rating: 5 },
            { reviewIndex: 111, rating: 3 },
            { reviewIndex: 112, rating: 4 },
            { reviewIndex: 113, rating: 5 },
            { reviewIndex: 114, rating: 4 },
            { reviewIndex: 115, rating: 5 },
            { reviewIndex: 116, rating: 5 },
            { reviewIndex: 117, rating: 4 },
            { reviewIndex: 118, rating: 3 },
            { reviewIndex: 119, rating: 5 },
    
            { reviewIndex: 120, rating: 4 },
            { reviewIndex: 121, rating: 5 },
            { reviewIndex: 122, rating: 5 },
            { reviewIndex: 123, rating: 4 },
            { reviewIndex: 124, rating: 5 },
            { reviewIndex: 125, rating: 3 },
            { reviewIndex: 126, rating: 4 },
            { reviewIndex: 127, rating: 5 },
            { reviewIndex: 128, rating: 5 },
            { reviewIndex: 129, rating: 4 },
    
            { reviewIndex: 130, rating: 5 },
            { reviewIndex: 131, rating: 4 },
            { reviewIndex: 132, rating: 5 },
            { reviewIndex: 133, rating: 3 },
            { reviewIndex: 134, rating: 5 },
            { reviewIndex: 135, rating: 4 },
            { reviewIndex: 136, rating: 5 },
            { reviewIndex: 137, rating: 5 },
            { reviewIndex: 138, rating: 4 },
            { reviewIndex: 139, rating: 5 },
    
            { reviewIndex: 140, rating: 4 },
            { reviewIndex: 141, rating: 5 },
            { reviewIndex: 142, rating: 5 },
            { reviewIndex: 143, rating: 3 },
            { reviewIndex: 144, rating: 4 },
            { reviewIndex: 145, rating: 5 },
            { reviewIndex: 146, rating: 5 },
            { reviewIndex: 147, rating: 4 },
            { reviewIndex: 148, rating: 5 },
            { reviewIndex: 149, rating: 4 },
    
            { reviewIndex: 150, rating: 5 },
            { reviewIndex: 151, rating: 4 },
            { reviewIndex: 152, rating: 5 },
            { reviewIndex: 153, rating: 3 },
            { reviewIndex: 154, rating: 5 },
            { reviewIndex: 155, rating: 4 },
            { reviewIndex: 156, rating: 5 },
            { reviewIndex: 157, rating: 5 },
            { reviewIndex: 158, rating: 4 },
            { reviewIndex: 159, rating: 5 },
    
            { reviewIndex: 160, rating: 4 },
            { reviewIndex: 161, rating: 5 },
            { reviewIndex: 162, rating: 3 },
            { reviewIndex: 163, rating: 5 },
            { reviewIndex: 164, rating: 4 },
            { reviewIndex: 165, rating: 5 },
            { reviewIndex: 166, rating: 5 },
            { reviewIndex: 167, rating: 4 },
            { reviewIndex: 168, rating: 5 },
            { reviewIndex: 169, rating: 3 },
    
            { reviewIndex: 170, rating: 5 },
            { reviewIndex: 171, rating: 4 },
            { reviewIndex: 172, rating: 5 },
            { reviewIndex: 173, rating: 4 },
            { reviewIndex: 174, rating: 5 },
            { reviewIndex: 175, rating: 3 },
            { reviewIndex: 176, rating: 4 },
            { reviewIndex: 177, rating: 5 },
            { reviewIndex: 178, rating: 5 },
            { reviewIndex: 179, rating: 4 },
    
            { reviewIndex: 180, rating: 5 },
            { reviewIndex: 181, rating: 4 },
            { reviewIndex: 182, rating: 3 },
            { reviewIndex: 183, rating: 5 },
            { reviewIndex: 184, rating: 4 },
            { reviewIndex: 185, rating: 5 },
            { reviewIndex: 186, rating: 5 },
            { reviewIndex: 187, rating: 4 },
            { reviewIndex: 188, rating: 5 },
            { reviewIndex: 189, rating: 3 },
    
            { reviewIndex: 190, rating: 5 },
            { reviewIndex: 191, rating: 4 },
            { reviewIndex: 192, rating: 5 },
            { reviewIndex: 193, rating: 4 },
            { reviewIndex: 194, rating: 5 },
            { reviewIndex: 195, rating: 3 },
            { reviewIndex: 196, rating: 5 },
            { reviewIndex: 197, rating: 4 },
            { reviewIndex: 198, rating: 5 },
            { reviewIndex: 199, rating: 2 },
    
    
            // =================================================
            // RATING + COMMENT
            // 300 REVIEWS
            // =================================================
    
            { reviewIndex: 200, rating: 5, comment: "خیلی خوشمزه بود، مخصوصاً طعم سسش. دوباره سفارش می‌دم." },
            { reviewIndex: 201, rating: 5, comment: "غذا تازه و گرم رسید و حجمش هم کاملاً مناسب بود." },
            { reviewIndex: 202, rating: 4, comment: "طعمش خوب بود، فقط کمی دیرتر از چیزی که انتظار داشتم رسید." },
            { reviewIndex: 203, rating: 5, comment: "واقعاً راضی بودم. همه چیز مرتب و تازه بود." },
            { reviewIndex: 204, rating: 4, comment: "خوش‌طعم بود و بسته‌بندی خوبی هم داشت." },
            { reviewIndex: 205, rating: 5, comment: "یکی از بهترین سفارش‌هایی بود که از اینجا داشتم." },
            { reviewIndex: 206, rating: 3, comment: "بد نبود، ولی انتظار داشتم غذا کمی گرم‌تر باشد." },
            { reviewIndex: 207, rating: 5, comment: "طعم غذا خیلی خوب بود و مقدارش هم کافی بود." },
            { reviewIndex: 208, rating: 4, comment: "در کل خوب بود، فقط نمکش کمی زیاد بود." },
            { reviewIndex: 209, rating: 5, comment: "خیلی خوب و تازه بود. مخصوصاً کنار غذا خیلی چسبید." },
    
            { reviewIndex: 210, rating: 5, comment: "همه چیز دقیقاً طبق سفارشم بود و چیزی کم نداشت." },
            { reviewIndex: 211, rating: 4, comment: "کیفیت خوب بود و بسته‌بندی هم تمیز و مرتب رسید." },
            { reviewIndex: 212, rating: 5, comment: "طعمش عالی بود، حتماً دوباره امتحانش می‌کنم." },
            { reviewIndex: 213, rating: 3, comment: "طعمش معمولی بود. نه بد بود نه خیلی خاص." },
            { reviewIndex: 214, rating: 5, comment: "خیلی تازه بود و معلوم بود تازه آماده شده." },
            { reviewIndex: 215, rating: 4, comment: "خوب بود، فقط مقدار سس می‌توانست بیشتر باشد." },
            { reviewIndex: 216, rating: 5, comment: "از کیفیت غذا واقعاً راضی بودم." },
            { reviewIndex: 217, rating: 5, comment: "گرم به دستم رسید و طعمش هم عالی بود." },
            { reviewIndex: 218, rating: 4, comment: "سفارش خوب و قابل قبولی بود." },
            { reviewIndex: 219, rating: 5, comment: "خیلی خوش‌طعم بود و حجمش هم خوب بود." },
    
            { reviewIndex: 220, rating: 4, comment: "طعم خوبی داشت ولی کمی شور بود." },
            { reviewIndex: 221, rating: 5, comment: "خیلی راضی بودم، کیفیت غذا واقعاً خوب بود." },
            { reviewIndex: 222, rating: 3, comment: "نسبت به قیمتش می‌توانست کمی بیشتر باشد." },
            { reviewIndex: 223, rating: 5, comment: "عالی بود، مخصوصاً وقتی گرم بود خیلی خوشمزه شد." },
            { reviewIndex: 224, rating: 4, comment: "در مجموع سفارش خوبی بود و دوباره می‌گیرم." },
            { reviewIndex: 225, rating: 5, comment: "طعمش خیلی خوب بود و اصلاً چرب و سنگین نبود." },
            { reviewIndex: 226, rating: 4, comment: "کیفیت خوب بود، فقط زمان ارسال کمی طولانی شد." },
            { reviewIndex: 227, rating: 5, comment: "واقعاً خوشمزه بود. از چیزی که انتظار داشتم بهتر بود." },
            { reviewIndex: 228, rating: 5, comment: "هم غذا خوب بود هم بسته‌بندی تمیز و مناسب بود." },
            { reviewIndex: 229, rating: 3, comment: "بد نبود، ولی فکر می‌کنم می‌توانست طعم بهتری داشته باشد." },
    
            { reviewIndex: 230, rating: 5, comment: "خیلی خوب بود، مخصوصاً طعم ادویه‌ها کاملاً مناسب بود." },
            { reviewIndex: 231, rating: 4, comment: "غذا خوشمزه بود و مقدارش هم مناسب بود." },
            { reviewIndex: 232, rating: 5, comment: "سفارش سریع رسید و غذا هنوز کاملاً گرم بود." },
            { reviewIndex: 233, rating: 4, comment: "خوب بود، فقط کمی خشک شده بود." },
            { reviewIndex: 234, rating: 5, comment: "همه چیز تازه و خوش‌طعم بود." },
            { reviewIndex: 235, rating: 5, comment: "خیلی دوست داشتم، مخصوصاً ترکیب طعم‌ها." },
            { reviewIndex: 236, rating: 3, comment: "متوسط بود و چیز خاصی نداشت." },
            { reviewIndex: 237, rating: 4, comment: "در کل راضی بودم و دوباره سفارش می‌دهم." },
            { reviewIndex: 238, rating: 5, comment: "خیلی خوشمزه و تازه بود." },
            { reviewIndex: 239, rating: 5, comment: "کیفیت غذا واقعاً خوب بود و حجمش هم مناسب بود." },
    
            { reviewIndex: 240, rating: 4, comment: "طعم خوب بود ولی کمی سرد شده بود." },
            { reviewIndex: 241, rating: 5, comment: "عالی بود، از سفارشم کاملاً راضی هستم." },
            { reviewIndex: 242, rating: 4, comment: "غذا خوب بود و بسته‌بندی هم مناسب بود." },
            { reviewIndex: 243, rating: 5, comment: "طعم خیلی خوبی داشت و دوباره سفارش می‌دم." },
            { reviewIndex: 244, rating: 3, comment: "قابل قبول بود ولی می‌توانست بهتر باشد." },
            { reviewIndex: 245, rating: 5, comment: "خیلی تازه و خوشمزه بود." },
            { reviewIndex: 246, rating: 4, comment: "کیفیت خوب بود، فقط کمی ادویه‌اش زیاد بود." },
            { reviewIndex: 247, rating: 5, comment: "یکی از سفارش‌های خوبم بود، همه چیز درست و مرتب رسید." },
            { reviewIndex: 248, rating: 5, comment: "واقعاً خوشمزه بود و حجم مناسبی هم داشت." },
            { reviewIndex: 249, rating: 4, comment: "در مجموع تجربه خوبی بود." },
    
            { reviewIndex: 250, rating: 5, comment: "غذا خیلی خوب آماده شده بود و طعمش عالی بود." },
            { reviewIndex: 251, rating: 4, comment: "خوب بود، فقط کمی روغنی بود." },
            { reviewIndex: 252, rating: 5, comment: "خیلی راضی بودم. همه چیز تازه و گرم رسید." },
            { reviewIndex: 253, rating: 3, comment: "طعم معمولی داشت و خیلی تحت تأثیر قرار نگرفتم." },
            { reviewIndex: 254, rating: 5, comment: "خیلی خوش‌طعم بود و کیفیتش مشخص بود." },
            { reviewIndex: 255, rating: 4, comment: "نسبت به قیمت کیفیت مناسبی داشت." },
            { reviewIndex: 256, rating: 5, comment: "عالی و خوشمزه بود، دوباره می‌گیرمش." },
            { reviewIndex: 257, rating: 5, comment: "هم داغ رسید هم مزه خیلی خوبی داشت." },
            { reviewIndex: 258, rating: 4, comment: "خوب بود، فقط کمی زمان ارسال بیشتر شد." },
            { reviewIndex: 259, rating: 5, comment: "از این سفارش خیلی راضی بودم." },
    
            { reviewIndex: 260, rating: 5, comment: "طعمش واقعاً عالی بود و کاملاً تازه به نظر می‌رسید." },
            { reviewIndex: 261, rating: 4, comment: "کیفیت خوب بود و مقدار غذا هم کافی بود." },
            { reviewIndex: 262, rating: 5, comment: "خیلی خوشمزه بود، مخصوصاً وقتی تازه رسید." },
            { reviewIndex: 263, rating: 3, comment: "در حد انتظار بود، نه بیشتر." },
            { reviewIndex: 264, rating: 5, comment: "همه چیز مرتب و بدون مشکل به دستم رسید." },
            { reviewIndex: 265, rating: 4, comment: "طعمش خوب بود ولی کمی شور بود." },
            { reviewIndex: 266, rating: 5, comment: "واقعاً سفارش خوبی بود." },
            { reviewIndex: 267, rating: 5, comment: "حجمش خوب بود و کیفیت غذا هم عالی بود." },
            { reviewIndex: 268, rating: 4, comment: "خوشمزه بود، فقط انتظار داشتم کمی بیشتر باشد." },
            { reviewIndex: 269, rating: 5, comment: "خیلی راضی بودم و احتمالاً دوباره سفارش می‌دم." },
    
            { reviewIndex: 270, rating: 5, comment: "غذا تازه بود و طعمش خیلی خوب بود." },
            { reviewIndex: 271, rating: 4, comment: "سفارش خوبی بود و همه چیز درست ارسال شده بود." },
            { reviewIndex: 272, rating: 3, comment: "کیفیت قابل قبول بود ولی عالی نبود." },
            { reviewIndex: 273, rating: 5, comment: "خیلی خوشمزه بود و از انتخابم راضی هستم." },
            { reviewIndex: 274, rating: 4, comment: "خوب بود، ولی مقدار سس کم بود." },
            { reviewIndex: 275, rating: 5, comment: "طعمش عالی بود و غذا هم گرم رسید." },
            { reviewIndex: 276, rating: 5, comment: "خیلی بهتر از چیزی بود که انتظار داشتم." },
            { reviewIndex: 277, rating: 4, comment: "در کل خوب بود و مشکل خاصی نداشت." },
            { reviewIndex: 278, rating: 5, comment: "کیفیت خیلی خوبی داشت." },
            { reviewIndex: 279, rating: 3, comment: "متوسط بود، شاید دوباره امتحانش کنم." },
    
            { reviewIndex: 280, rating: 5, comment: "خیلی خوش‌طعم و تازه بود." },
            { reviewIndex: 281, rating: 4, comment: "غذا خوب بود، فقط کمی خشک شده بود." },
            { reviewIndex: 282, rating: 5, comment: "واقعاً راضی بودم و همه چیز مرتب بود." },
            { reviewIndex: 283, rating: 5, comment: "طعمش عالی بود و حجم خوبی هم داشت." },
            { reviewIndex: 284, rating: 4, comment: "سفارش خوبی بود و به‌موقع رسید." },
            { reviewIndex: 285, rating: 3, comment: "بد نبود ولی انتظار بیشتری داشتم." },
            { reviewIndex: 286, rating: 5, comment: "خیلی تازه و خوشمزه بود." },
            { reviewIndex: 287, rating: 4, comment: "در مجموع کیفیت خوبی داشت." },
            { reviewIndex: 288, rating: 5, comment: "طعم غذا خیلی خوب بود." },
            { reviewIndex: 289, rating: 5, comment: "از سفارشم کاملاً راضی بودم." },
    
            { reviewIndex: 290, rating: 4, comment: "خوب بود، فقط کمی شور بود." },
            { reviewIndex: 291, rating: 5, comment: "واقعاً خوشمزه بود و دوباره سفارش می‌دم." },
            { reviewIndex: 292, rating: 3, comment: "قابل قبول بود، ولی خیلی خاص نبود." },
            { reviewIndex: 293, rating: 5, comment: "غذا گرم و تازه رسید." },
            { reviewIndex: 294, rating: 4, comment: "کیفیت مناسبی داشت و ازش راضی بودم." },
            { reviewIndex: 295, rating: 5, comment: "هم طعم خوب بود هم حجم مناسب." },
            { reviewIndex: 296, rating: 4, comment: "سفارش خوب و بدون دردسری بود." },
            { reviewIndex: 297, rating: 5, comment: "خیلی خوشمزه بود، مخصوصاً طعم ادویه‌ها." },
            { reviewIndex: 298, rating: 5, comment: "از کیفیت این سفارش خیلی راضی بودم." },
            { reviewIndex: 299, rating: 4, comment: "خوب بود و احتمالاً دوباره سفارش می‌دم." },
    
            { reviewIndex: 300, rating: 5, comment: "واقعاً عالی بود و کاملاً تازه به دستم رسید." },
            { reviewIndex: 301, rating: 4, comment: "طعم خوبی داشت و حجمش هم مناسب بود." },
            { reviewIndex: 302, rating: 5, comment: "یکی از سفارش‌های مورد علاقه‌ام شد." },
            { reviewIndex: 303, rating: 3, comment: "معمولی بود و می‌توانست کیفیت بهتری داشته باشد." },
            { reviewIndex: 304, rating: 5, comment: "خیلی خوشمزه و تازه بود." },
            { reviewIndex: 305, rating: 4, comment: "در کل تجربه خوبی بود." },
            { reviewIndex: 306, rating: 5, comment: "بسته‌بندی خوب بود و غذا هم گرم رسید." },
            { reviewIndex: 307, rating: 5, comment: "طعمش واقعاً عالی بود." },
            { reviewIndex: 308, rating: 4, comment: "خوب بود، فقط کمی دیر رسید." },
            { reviewIndex: 309, rating: 5, comment: "خیلی راضی بودم." },
    
            { reviewIndex: 310, rating: 4, comment: "کیفیت خوب و طعم قابل قبولی داشت." },
            { reviewIndex: 311, rating: 5, comment: "خیلی خوشمزه بود و حجم خوبی داشت." },
            { reviewIndex: 312, rating: 5, comment: "همه چیز مرتب و تازه بود." },
            { reviewIndex: 313, rating: 3, comment: "بد نبود ولی خیلی هم فوق‌العاده نبود." },
            { reviewIndex: 314, rating: 4, comment: "طعم خوب بود ولی کمی چرب بود." },
            { reviewIndex: 315, rating: 5, comment: "خیلی خوب بود و دوباره سفارش می‌دم." },
            { reviewIndex: 316, rating: 5, comment: "غذا داغ و خوش‌طعم رسید." },
            { reviewIndex: 317, rating: 4, comment: "در مجموع راضی بودم." },
            { reviewIndex: 318, rating: 5, comment: "کیفیت غذا واقعاً خوب بود." },
            { reviewIndex: 319, rating: 5, comment: "خیلی خوشمزه بود." },
    
            { reviewIndex: 320, rating: 4, comment: "خوب بود، فقط مقدارش کمی کم بود." },
            { reviewIndex: 321, rating: 5, comment: "طعم خیلی خوبی داشت و تازه بود." },
            { reviewIndex: 322, rating: 3, comment: "قابل قبول بود اما انتظار بیشتری داشتم." },
            { reviewIndex: 323, rating: 5, comment: "همه چیز عالی و مرتب بود." },
            { reviewIndex: 324, rating: 4, comment: "طعم خوبی داشت و بسته‌بندی هم مناسب بود." },
            { reviewIndex: 325, rating: 5, comment: "خیلی راضی بودم، مخصوصاً از کیفیت غذا." },
            { reviewIndex: 326, rating: 5, comment: "واقعاً خوشمزه و تازه بود." },
            { reviewIndex: 327, rating: 4, comment: "خوب بود و به موقع رسید." },
            { reviewIndex: 328, rating: 5, comment: "یکی از سفارش‌های خوبم بود." },
            { reviewIndex: 329, rating: 4, comment: "کیفیت مناسبی داشت." },
    
            { reviewIndex: 330, rating: 5, comment: "طعمش خیلی خوب بود و کاملاً راضی بودم." },
            { reviewIndex: 331, rating: 4, comment: "خوب بود، فقط کمی نمک بیشتری داشت." },
            { reviewIndex: 332, rating: 5, comment: "غذا گرم و تازه رسید." },
            { reviewIndex: 333, rating: 3, comment: "متوسط بود و خیلی خاص نبود." },
            { reviewIndex: 334, rating: 5, comment: "خیلی خوشمزه بود و حجمش هم مناسب بود." },
            { reviewIndex: 335, rating: 4, comment: "در کل سفارش خوبی بود." },
            { reviewIndex: 336, rating: 5, comment: "کیفیتش واقعاً خوب بود." },
            { reviewIndex: 337, rating: 5, comment: "طعم عالی و بسته‌بندی مرتب بود." },
            { reviewIndex: 338, rating: 4, comment: "خوب بود ولی کمی سرد شده بود." },
            { reviewIndex: 339, rating: 5, comment: "خیلی راضی بودم و دوباره سفارش می‌دم." },
    
            { reviewIndex: 340, rating: 4, comment: "طعم خوبی داشت و نسبت به قیمت مناسب بود." },
            { reviewIndex: 341, rating: 5, comment: "واقعاً خوشمزه بود." },
            { reviewIndex: 342, rating: 5, comment: "تازه و خوش‌طعم بود." },
            { reviewIndex: 343, rating: 3, comment: "کیفیت متوسط بود." },
            { reviewIndex: 344, rating: 5, comment: "هم حجم مناسب بود هم طعم عالی." },
            { reviewIndex: 345, rating: 4, comment: "سفارش خوبی بود و مشکل خاصی نداشت." },
            { reviewIndex: 346, rating: 5, comment: "از کیفیت غذا خیلی راضی بودم." },
            { reviewIndex: 347, rating: 4, comment: "خوشمزه بود، فقط کمی چرب بود." },
            { reviewIndex: 348, rating: 5, comment: "خیلی تازه و گرم رسید." },
            { reviewIndex: 349, rating: 5, comment: "عالی بود، دوباره حتماً سفارش می‌دم." },
    
            { reviewIndex: 350, rating: 4, comment: "در مجموع خوب بود و ارزش امتحان کردن دارد." },
            { reviewIndex: 351, rating: 5, comment: "طعمش خیلی خوب بود." },
            { reviewIndex: 352, rating: 3, comment: "بد نبود، ولی می‌توانست بهتر باشد." },
            { reviewIndex: 353, rating: 5, comment: "خیلی خوشمزه و تازه بود." },
            { reviewIndex: 354, rating: 4, comment: "کیفیت خوب و حجم مناسب داشت." },
            { reviewIndex: 355, rating: 5, comment: "کاملاً از سفارشم راضی بودم." },
            { reviewIndex: 356, rating: 5, comment: "هم طعم خوب بود هم غذا گرم رسید." },
            { reviewIndex: 357, rating: 4, comment: "سفارش خوبی بود." },
            { reviewIndex: 358, rating: 5, comment: "خیلی بهتر از چیزی بود که انتظار داشتم." },
            { reviewIndex: 359, rating: 4, comment: "خوشمزه بود ولی کمی شور بود." },
    
            { reviewIndex: 360, rating: 5, comment: "واقعاً کیفیت خوبی داشت." },
            { reviewIndex: 361, rating: 4, comment: "طعم خوب و حجم مناسبی داشت." },
            { reviewIndex: 362, rating: 5, comment: "خیلی راضی بودم." },
            { reviewIndex: 363, rating: 3, comment: "در حد متوسط بود." },
            { reviewIndex: 364, rating: 5, comment: "تازه و خوش‌طعم بود." },
            { reviewIndex: 365, rating: 4, comment: "بسته‌بندی خوب بود و غذا هم سالم رسید." },
            { reviewIndex: 366, rating: 5, comment: "طعمش عالی بود." },
            { reviewIndex: 367, rating: 5, comment: "خیلی خوشمزه بود و دوباره سفارش می‌دم." },
            { reviewIndex: 368, rating: 4, comment: "خوب بود ولی زمان ارسال کمی طولانی شد." },
            { reviewIndex: 369, rating: 5, comment: "کاملاً راضی بودم." },
    
            { reviewIndex: 370, rating: 4, comment: "غذا خوشمزه بود و حجم خوبی داشت." },
            { reviewIndex: 371, rating: 5, comment: "خیلی تازه و خوش‌طعم بود." },
            { reviewIndex: 372, rating: 5, comment: "یکی از بهترین سفارش‌هام بود." },
            { reviewIndex: 373, rating: 3, comment: "طعم معمولی داشت." },
            { reviewIndex: 374, rating: 4, comment: "در مجموع خوب و قابل قبول بود." },
            { reviewIndex: 375, rating: 5, comment: "خیلی خوب بود، مخصوصاً از نظر تازگی." },
            { reviewIndex: 376, rating: 5, comment: "طعم عالی و حجم مناسب." },
            { reviewIndex: 377, rating: 4, comment: "خوب بود، فقط کمی سرد شده بود." },
            { reviewIndex: 378, rating: 5, comment: "خیلی خوشمزه بود." },
            { reviewIndex: 379, rating: 4, comment: "کیفیت خوبی داشت." },
    
            { reviewIndex: 380, rating: 5, comment: "واقعاً راضی بودم و دوباره سفارش می‌دم." },
            { reviewIndex: 381, rating: 4, comment: "طعم خوبی داشت." },
            { reviewIndex: 382, rating: 5, comment: "خیلی تازه بود." },
            { reviewIndex: 383, rating: 3, comment: "بد نبود ولی خیلی خاص هم نبود." },
            { reviewIndex: 384, rating: 5, comment: "غذا گرم و مرتب رسید." },
            { reviewIndex: 385, rating: 4, comment: "خوب بود و حجمش هم مناسب بود." },
            { reviewIndex: 386, rating: 5, comment: "طعمش خیلی خوب بود." },
            { reviewIndex: 387, rating: 5, comment: "از کیفیتش راضی بودم." },
            { reviewIndex: 388, rating: 4, comment: "در کل سفارش خوبی بود." },
            { reviewIndex: 389, rating: 5, comment: "عالی و خوشمزه بود." },
    
            { reviewIndex: 390, rating: 4, comment: "طعم خوب بود، فقط کمی روغنی بود." },
            { reviewIndex: 391, rating: 5, comment: "خیلی تازه و خوش‌طعم بود." },
            { reviewIndex: 392, rating: 5, comment: "همه چیز خوب و مرتب بود." },
            { reviewIndex: 393, rating: 3, comment: "متوسط بود و انتظار بیشتری داشتم." },
            { reviewIndex: 394, rating: 5, comment: "واقعاً خوشمزه بود." },
            { reviewIndex: 395, rating: 4, comment: "کیفیت خوبی داشت و راضی بودم." },
            { reviewIndex: 396, rating: 5, comment: "غذا گرم رسید و طعمش عالی بود." },
            { reviewIndex: 397, rating: 4, comment: "خوب بود ولی کمی نمک زیاد داشت." },
            { reviewIndex: 398, rating: 5, comment: "خیلی خوب و تازه بود." },
            { reviewIndex: 399, rating: 5, comment: "دوباره حتماً سفارش می‌دم." },
    
            { reviewIndex: 400, rating: 4, comment: "سفارش خوبی بود و همه چیز درست ارسال شد." },
            { reviewIndex: 401, rating: 5, comment: "طعم خیلی خوبی داشت." },
            { reviewIndex: 402, rating: 3, comment: "قابل قبول بود ولی عالی نبود." },
            { reviewIndex: 403, rating: 5, comment: "خیلی خوشمزه و تازه بود." },
            { reviewIndex: 404, rating: 4, comment: "حجم خوب بود و کیفیت هم مناسب بود." },
            { reviewIndex: 405, rating: 5, comment: "واقعاً از سفارشم راضی بودم." },
            { reviewIndex: 406, rating: 5, comment: "هم گرم بود هم خوش‌طعم." },
            { reviewIndex: 407, rating: 4, comment: "در کل تجربه خوبی بود." },
            { reviewIndex: 408, rating: 5, comment: "کیفیت غذا خیلی خوب بود." },
            { reviewIndex: 409, rating: 4, comment: "خوب بود و ارزش سفارش دوباره دارد." },
    
            { reviewIndex: 410, rating: 5, comment: "خیلی خوشمزه بود." },
            { reviewIndex: 411, rating: 4, comment: "طعم خوبی داشت ولی کمی سرد شده بود." },
            { reviewIndex: 412, rating: 5, comment: "تازه و باکیفیت بود." },
            { reviewIndex: 413, rating: 3, comment: "طعم معمولی بود." },
            { reviewIndex: 414, rating: 5, comment: "خیلی راضی بودم." },
            { reviewIndex: 415, rating: 4, comment: "سفارش خوب و مرتب بود." },
            { reviewIndex: 416, rating: 5, comment: "طعمش واقعاً عالی بود." },
            { reviewIndex: 417, rating: 5, comment: "خیلی خوشمزه و تازه رسید." },
            { reviewIndex: 418, rating: 4, comment: "کیفیت مناسب بود." },
            { reviewIndex: 419, rating: 5, comment: "دوباره سفارش می‌دم." },
    
            { reviewIndex: 420, rating: 4, comment: "خوب بود و حجم مناسبی داشت." },
            { reviewIndex: 421, rating: 5, comment: "خیلی خوش‌طعم بود." },
            { reviewIndex: 422, rating: 5, comment: "غذا گرم و تازه بود." },
            { reviewIndex: 423, rating: 3, comment: "در حد انتظار بود." },
            { reviewIndex: 424, rating: 4, comment: "در مجموع راضی بودم." },
            { reviewIndex: 425, rating: 5, comment: "خیلی خوب بود و دوباره می‌گیرمش." },
            { reviewIndex: 426, rating: 5, comment: "کیفیت واقعاً خوبی داشت." },
            { reviewIndex: 427, rating: 4, comment: "طعم خوب بود، فقط کمی شور بود." },
            { reviewIndex: 428, rating: 5, comment: "خیلی خوشمزه بود." },
            { reviewIndex: 429, rating: 5, comment: "کاملاً راضی بودم." },
    
            { reviewIndex: 430, rating: 4, comment: "سفارش خوبی بود و مشکل خاصی نداشت." },
            { reviewIndex: 431, rating: 5, comment: "خیلی تازه و خوش‌طعم بود." },
            { reviewIndex: 432, rating: 3, comment: "بد نبود ولی می‌توانست بهتر باشد." },
            { reviewIndex: 433, rating: 5, comment: "طعم عالی داشت." },
            { reviewIndex: 434, rating: 4, comment: "حجم و کیفیت مناسب بود." },
            { reviewIndex: 435, rating: 5, comment: "خیلی خوب بود و سریع هم آماده شده بود." },
            { reviewIndex: 436, rating: 5, comment: "از انتخابم راضی بودم." },
            { reviewIndex: 437, rating: 4, comment: "در کل خوب بود." },
            { reviewIndex: 438, rating: 5, comment: "واقعاً خوشمزه بود." },
            { reviewIndex: 439, rating: 4, comment: "کیفیت قابل قبولی داشت." },
    
            { reviewIndex: 440, rating: 5, comment: "خیلی تازه بود و طعم خوبی داشت." },
            { reviewIndex: 441, rating: 4, comment: "خوب بود، فقط کمی دیر رسید." },
            { reviewIndex: 442, rating: 5, comment: "عالی بود و دوباره سفارش می‌دم." },
            { reviewIndex: 443, rating: 3, comment: "معمولی بود." },
            { reviewIndex: 444, rating: 5, comment: "خیلی خوشمزه و گرم بود." },
            { reviewIndex: 445, rating: 4, comment: "سفارش خوبی بود." },
            { reviewIndex: 446, rating: 5, comment: "کیفیت غذا خیلی خوب بود." },
            { reviewIndex: 447, rating: 5, comment: "از طعمش خیلی راضی بودم." },
            { reviewIndex: 448, rating: 4, comment: "خوب بود و حجمش مناسب بود." },
            { reviewIndex: 449, rating: 5, comment: "خیلی راضی بودم." },
    
            { reviewIndex: 450, rating: 4, comment: "طعم خوب و کیفیت مناسبی داشت." },
            { reviewIndex: 451, rating: 5, comment: "واقعاً خوشمزه بود." },
            { reviewIndex: 452, rating: 5, comment: "تازه و گرم به دستم رسید." },
            { reviewIndex: 453, rating: 3, comment: "بد نبود، ولی انتظار بیشتری داشتم." },
            { reviewIndex: 454, rating: 5, comment: "خیلی خوب بود و دوباره می‌گیرم." },
            { reviewIndex: 455, rating: 4, comment: "کیفیت خوبی داشت." },
            { reviewIndex: 456, rating: 5, comment: "طعمش عالی بود." },
            { reviewIndex: 457, rating: 4, comment: "در کل تجربه خوبی بود." },
            { reviewIndex: 458, rating: 5, comment: "خیلی خوش‌طعم و تازه بود." },
            { reviewIndex: 459, rating: 5, comment: "کاملاً راضی بودم." },
    
            { reviewIndex: 460, rating: 4, comment: "خوب بود و بسته‌بندی مناسبی داشت." },
            { reviewIndex: 461, rating: 5, comment: "خیلی خوشمزه بود." },
            { reviewIndex: 462, rating: 3, comment: "طعم معمولی داشت." },
            { reviewIndex: 463, rating: 5, comment: "خیلی تازه و باکیفیت بود." },
            { reviewIndex: 464, rating: 4, comment: "سفارش خوبی بود." },
            { reviewIndex: 465, rating: 5, comment: "طعم خیلی خوبی داشت و گرم رسید." },
            { reviewIndex: 466, rating: 5, comment: "از کیفیتش کاملاً راضی بودم." },
            { reviewIndex: 467, rating: 4, comment: "خوب بود، فقط کمی چرب بود." },
            { reviewIndex: 468, rating: 5, comment: "دوباره حتماً سفارش می‌دم." },
            { reviewIndex: 469, rating: 4, comment: "در مجموع رضایت‌بخش بود." },
    
            { reviewIndex: 470, rating: 5, comment: "خیلی خوشمزه و تازه بود." },
            { reviewIndex: 471, rating: 4, comment: "کیفیت خوب بود." },
            { reviewIndex: 472, rating: 5, comment: "واقعاً عالی بود." },
            { reviewIndex: 473, rating: 3, comment: "قابل قبول بود." },
            { reviewIndex: 474, rating: 5, comment: "طعمش خیلی خوب بود." },
            { reviewIndex: 475, rating: 4, comment: "حجم مناسب و کیفیت خوبی داشت." },
            { reviewIndex: 476, rating: 5, comment: "غذا گرم و مرتب رسید." },
            { reviewIndex: 477, rating: 5, comment: "خیلی راضی بودم." },
            { reviewIndex: 478, rating: 4, comment: "خوب بود و ارزش دوباره سفارش دادن دارد." },
            { reviewIndex: 479, rating: 5, comment: "طعم عالی داشت." },
    
            { reviewIndex: 480, rating: 4, comment: "سفارش خوب و قابل قبولی بود." },
            { reviewIndex: 481, rating: 5, comment: "خیلی تازه و خوشمزه بود." },
            { reviewIndex: 482, rating: 5, comment: "از کیفیت غذا راضی بودم." },
            { reviewIndex: 483, rating: 3, comment: "معمولی بود، شاید دفعه بعد غذای دیگری امتحان کنم." },
            { reviewIndex: 484, rating: 5, comment: "خیلی خوش‌طعم بود." },
            { reviewIndex: 485, rating: 4, comment: "خوب بود ولی کمی شور بود." },
            { reviewIndex: 486, rating: 5, comment: "کاملاً راضی بودم." },
            { reviewIndex: 487, rating: 4, comment: "در کل کیفیت مناسبی داشت." },
            { reviewIndex: 488, rating: 5, comment: "خیلی خوشمزه بود." },
            { reviewIndex: 489, rating: 5, comment: "دوباره سفارش می‌دم." },
    
            { reviewIndex: 490, rating: 4, comment: "طعم خوب و حجم مناسبی داشت." },
            { reviewIndex: 491, rating: 5, comment: "خیلی تازه بود." },
            { reviewIndex: 492, rating: 3, comment: "بد نبود ولی خیلی خاص نبود." },
            { reviewIndex: 493, rating: 5, comment: "واقعاً خوشمزه بود." },
            { reviewIndex: 494, rating: 4, comment: "کیفیت خوب بود و راضی بودم." },
            { reviewIndex: 495, rating: 5, comment: "خیلی خوب و گرم رسید." },
            { reviewIndex: 496, rating: 5, comment: "طعمش عالی بود." },
            { reviewIndex: 497, rating: 4, comment: "در مجموع سفارش خوبی بود." },
            { reviewIndex: 498, rating: 5, comment: "خیلی راضی بودم و دوباره سفارش می‌دم." },
            { reviewIndex: 499, rating: 2, comment: "متأسفانه این بار کیفیتش پایین‌تر از انتظارم بود." }
    
        ];
    
    
        // =====================================================
        // SAFETY CHECK
        // =====================================================
    
        if (reviewData.length !== 500) {
    
            throw new Error(
                `Expected 500 manual reviews, but found ${reviewData.length}.`
            );
    
        }
    
    
        // =====================================================
        // CREATE REVIEWS
        // =====================================================
    
        let createdReviews = 0;
    
        for (const data of reviewData) {
    
            const orderItem =
                deliveredOrderItems[data.reviewIndex];
    
    
            if (!orderItem) {
    
                throw new Error(
                    `Delivered OrderItem at index ${data.reviewIndex} not found.`
                );
    
            }
    
    
            // -------------------------------------------------
            // CHECK FOR EXISTING REVIEW
            // -------------------------------------------------
    
            const existingReview =
                await prisma.review.findUnique({
    
                    where: {
    
                        orderItemId:
                            orderItem.id
    
                    }
    
                });
    
    
            if (existingReview) {
    
                console.log(
                    `⚠️ Review already exists for OrderItem ${orderItem.id}. Skipping.`
                );
    
                continue;
    
            }
    
    
            // -------------------------------------------------
            // CREATE REVIEW
            // -------------------------------------------------
    
            await prisma.review.create({
    
                data: {
    
                    userId:
                        orderItem.order.userId,
    
                    restaurantId:
                        orderItem.order.restaurantId,
    
                    orderItemId:
                        orderItem.id,
    
                    rating:
                        data.rating,
    
                    ...(data.comment
                        ? {
                            comment:
                                data.comment
                        }
                        : {})
    
                }
    
            });
    
    
            createdReviews++;
    
            console.log(
                `⭐ Review ${createdReviews}/500 created - Rating: ${data.rating}`
            );
    
        }
    
    
        console.log("");
    
        console.log(
            `✅ ${createdReviews} reviews created.`
        );
    */





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