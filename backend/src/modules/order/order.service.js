import prisma from "../../config/prisma.js";

export async function createOrder(userId, data) {

    const { deliveryAddressId } = data;

    // گرفتن cart
    const cart = await prisma.cart.findUnique({

        where: { userId },

        include: {
            cartItems: {
                include: {
                    food: true
                }
            }
        }

    });

    if (!cart || cart.cartItems.length === 0) {
        throw new Error("Cart is empty.");
    }

    // چک کردن آدرس
    const address = await prisma.deliveryAddress.findUnique({
        where: { id: deliveryAddressId }
    });

    if (!address || address.userId !== userId) {
        throw new Error("Invalid delivery address.");
    }

    // ساخت order اولیه
    const order = await prisma.order.create({

        data: {

            userId,
            restaurantId: cart.restaurantId,
            deliveryAddressId,

            status: "PENDING",

            totalPrice: 0,
            deliveryFee: 0,
            finalPrice: 0
        }

    });

    let totalPrice = 0;

    // ساخت order items
    for (const item of cart.cartItems) {

        const itemTotal = Number(item.unitPrice) * item.quantity;

        totalPrice += itemTotal;

        await prisma.orderItem.create({

            data: {
                orderId: order.id,
                foodId: item.foodId,
                quantity: item.quantity,
                unitPrice: item.unitPrice
            }

        });

    }

    // محاسبه هزینه ارسال (فعلاً ساده)
    const deliveryFee = 20000;

    const finalPrice = totalPrice + deliveryFee;

    // آپدیت order
    const updatedOrder = await prisma.order.update({

        where: { id: order.id },

        data: {
            totalPrice,
            deliveryFee,
            finalPrice
        },

        include: {
            orderItems: true,
            restaurant: true,
            deliveryAddress: true
        }

    });

    // پاک کردن cart (طبق تصمیم A)
    await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
    });

    return updatedOrder;
}


// گرفتن سفارش‌های کاربر
export async function getMyOrders(userId) {

    return prisma.order.findMany({

        where: { userId },

        include: {
            orderItems: {
                include: {
                    food: true
                }
            },
            restaurant: true,
            driver: true,
            deliveryAddress: true
        },

        orderBy: {
            createdAt: "desc"
        }

    });

}


// گرفتن یک سفارش
export async function getOrderById(userId, orderId) {

    const order = await prisma.order.findUnique({

        where: { id: orderId },

        include: {
            orderItems: {
                include: {
                    food: true
                }
            },
            restaurant: true,
            driver: true,
            deliveryAddress: true
        }

    });

    if (!order) {
        throw new Error("Order not found.");
    }

    if (order.userId !== userId) {
        throw new Error("Access denied.");
    }

    return order;
}


export async function getRestaurantOrders(userId) {

    const restaurant = await prisma.restaurant.findFirst({

        where: {

            managerId: userId

        }

    });

    if (!restaurant) {

        throw new Error("Restaurant not found.");

    }

    return await prisma.order.findMany({

        where: {

            restaurantId: restaurant.id

        },

        include: {

            user: true,

            orderItems: {

                include: {

                    food: true

                }

            },

            deliveryAddress: true

        },

        orderBy: {

            createdAt: "desc"

        }

    });

}

export async function updateRestaurantOrderStatus(

    userId,

    orderId,

    status

) {

    const restaurant = await prisma.restaurant.findFirst({

        where: {

            managerId: userId

        }

    });

    if (!restaurant) {

        throw new Error("Restaurant not found.");

    }

    const order = await prisma.order.findFirst({

        where: {

            id: orderId,

            restaurantId: restaurant.id

        }

    });

    if (!order) {

        throw new Error("Order not found.");

    }

    return await prisma.order.update({

        where: {

            id: orderId

        },

        data: {

            status

        }

    });

}


export async function getAvailableOrders() {

    return prisma.order.findMany({

        where: {

            status: "READY_FOR_PICKUP",

            driverId: null

        },


        include: {

            user: {

                select: {

                    firstName: true,

                    lastName: true,

                    phone: true

                }

            },

            restaurant: {

                select: {

                    id: true,

                    name: true,

                    phone: true,

                    address: true

                }

            },

            deliveryAddress: {

                select: {

                    title: true,

                    receiverName: true,

                    receiverPhone: true,

                    address: true

                }

            },

            orderItems: {

                select: {

                    quantity: true,

                    unitPrice: true,

                    food: {

                        select: {

                            id: true,

                            name: true,

                            imageUrl: true

                        }

                    }

                }

            }

        },



        orderBy: {

            createdAt: "asc"

        }

    });

}



export async function acceptOrder(driverUserId, orderId) {

    const driver = await prisma.driver.findUnique({

        where: {

            userId: driverUserId

        }

    });

    if (!driver) {

        throw new Error("Driver not found.");

    }

    const order = await prisma.order.findUnique({

        where: {

            id: orderId

        }

    });

    if (!order) {

        throw new Error("Order not found.");

    }

    if (order.driverId) {

        throw new Error("Order has already been accepted.");

    }

    if (order.status !== "READY_FOR_PICKUP") {

        throw new Error("Order is not ready for pickup.");

    }

    return prisma.order.update({

        where: {

            id: orderId

        },

        data: {

            driverId: driver.id,

            status: "PICKED_UP"

        },

        include: {

            restaurant: {

                select: {

                    id: true,

                    name: true,

                    phone: true,

                    address: true

                }

            },

            user: {

                select: {

                    firstName: true,

                    lastName: true,

                    phone: true

                }

            },

            deliveryAddress: {

                select: {

                    title: true,

                    receiverName: true,

                    receiverPhone: true,

                    address: true

                }

            },

            orderItems: {

                include: {

                    food: {

                        select: {

                            name: true,

                            imageUrl: true

                        }

                    }

                }

            }

        }

    });

}


export async function getMyDeliveries(driverUserId) {

    const driver = await prisma.driver.findUnique({

        where: {

            userId: driverUserId

        }

    });

    if (!driver) {

        throw new Error("Driver not found.");

    }

    return prisma.order.findMany({

        where: {

            driverId: driver.id,

            status: "PICKED_UP"

        },

        include: {

            restaurant: {

                select: {

                    id: true,

                    name: true,

                    phone: true,

                    address: true

                }

            },

            user: {

                select: {

                    firstName: true,

                    lastName: true,

                    phone: true

                }

            },

            deliveryAddress: {

                select: {

                    title: true,

                    receiverName: true,

                    receiverPhone: true,

                    address: true

                }

            },

            orderItems: {

                select: {

                    quantity: true,

                    unitPrice: true,

                    food: {

                        select: {

                            id: true,

                            name: true,

                            imageUrl: true

                        }

                    }

                }

            }

        },

        orderBy: {

            createdAt: "desc"

        }

    });

}



export async function deliverOrder(driverUserId, orderId) {

    const driver = await prisma.driver.findUnique({

        where: {

            userId: driverUserId

        }

    });

    if (!driver) {

        throw new Error("Driver not found.");

    }

    const order = await prisma.order.findUnique({

        where: {

            id: orderId

        }

    });

    if (!order) {

        throw new Error("Order not found.");

    }

    if (order.driverId !== driver.id) {

        throw new Error("Access denied.");

    }

    if (order.status !== "PICKED_UP") {

        throw new Error("Order is not picked up.");

    }

    return prisma.order.update({

        where: {

            id: orderId

        },

        data: {

            status: "DELIVERED"

        },

        include: {

            restaurant: {

                select: {

                    name: true

                }

            },

            user: {

                select: {

                    firstName: true,

                    lastName: true,

                    phone: true

                }

            }

        }

    });

}