exports.success = (data) => {
    return {
        success: true,
        data
    };
};

exports.error = (message) => {
    return {
        success: false,
        message
    };
};