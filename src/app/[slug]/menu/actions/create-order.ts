"use server";

import { ConsumptionMethod } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/prisma";

import { removeCpfPunctuation } from "../helpers/cpf";

interface CreateOrderInput {
  customerName: string;
  customerCPF: string;
  products: Array<{
    id: string;
    price: number;
    quantity: number;
  }>;
  consumptionMethod: ConsumptionMethod;
  slug: string;
}

export const createOrder = async (input: CreateOrderInput) => {
  const restaurant = await db.restaurant.findUnique({
    where: {
      slug: input.slug,
    },
  });
  if (!restaurant) {
    throw new Error("Restaurant not found");
  }
  const productWithPrices = await db.product.findMany({
    where: {
      id: {
        in: input.products.map((product) => product.id),
      },
    },
  });
  const productsWithPricesAndQuantities = input.products.map((product) => ({
    productId: product.id,
    quantity: product.quantity,
    price: productWithPrices.find((p) => p.id === product.id)!.price,
  }));
  const order = await db.order.create({
    data: {
      status: "PENDING",
      customerName: input.customerName,
      customerCPF: removeCpfPunctuation(input.customerCPF),
      orderProducts: {
        createMany: {
          data: productsWithPricesAndQuantities,
        },
      },
      total: productsWithPricesAndQuantities.reduce(
        (acc, product) => acc + product.price * product.quantity,
        0,
      ),
      consumptionMethod: input.consumptionMethod,
      restaurantId: restaurant.id,
    },
  });
  revalidatePath(`/${input.slug}/orders`);
  //redirect(
  //  `/${input.slug}/orders?cpf=${removeCpfPunctuation(input.customerCPF)}`,
  //);
  return order;
};
