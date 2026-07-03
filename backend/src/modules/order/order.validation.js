import { z } from "zod";

export const createOrderSchema = z.object({

    deliveryAddressId: z

        .uuid()

});