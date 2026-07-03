exports.getHealthStatus = () => {
    return {
        status: "OK",
        message: "FoodStore Backend is running 🚀",
        timestamp: new Date().toISOString()
    };
};