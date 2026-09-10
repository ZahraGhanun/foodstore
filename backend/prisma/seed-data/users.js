export const customerData = [
    {
        firstName: "Customer",
        lastName: "Test",
        phone: "09131111111",
        email: "customer@foodstore.com"
    },

    ...Array.from({ length: 29 }, (_, index) => {
        const i = index + 2;

        return {
            firstName: `Customer${i}`,
            lastName: "Test",
            phone: `0913111${String(i).padStart(4, "0")}`,
            email: `customer${i}@foodstore.com`
        };
    })
];


export const managerData = [

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


export const adminData = {
    firstName: "System",
    lastName: "Administrator",
    phone: "09131313131",
    email: "admin@foodstore.com"
};


export const driverData = {
    firstName: "Driver",
    lastName: "Test",
    phone: "09133333333",
    email: "driver@foodstore.com"
};