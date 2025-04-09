import axios from "axios";
import React from "react";
import { useQuery, useQueryClient, useMutation } from "react-query";
import API_PATHS from "~/constants/apiPaths";
import { CartItem } from "~/models/CartItem";
import { useAvailableProducts } from "./products";

type CartResponse = {
  productId: string;
  count: number;
}[];

export function useCart() {
  const { data: products } = useAvailableProducts();

  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const token = localStorage.getItem("authorization_token");
      const res = await axios.get<CartResponse>(
        `${API_PATHS.cart}/api/profile/cart`,
        {
          headers: {
            Authorization: token && `Basic ${token}`,
          },
        }
      );
      return res.data;
    },
    select: (items) => {
      return items.reduce<CartItem[]>((result, item) => {
        const product = products?.find(({ id }) => id === item.productId);
        if (!product) return result;
        return [...result, { product, count: item.count }];
      }, []);
    },
  });
}

export function useCartData() {
  const queryClient = useQueryClient();
  return queryClient.getQueryData<CartItem[]>("cart");
}

export function useInvalidateCart() {
  const queryClient = useQueryClient();
  return React.useCallback(
    () => queryClient.invalidateQueries("cart", { exact: true }),
    []
  );
}

export function useUpsertCart() {
  return useMutation((values: CartItem) => {
    const token = localStorage.getItem("authorization_token");
    return axios.put<CartItem[]>(`${API_PATHS.cart}/api/profile/cart`, values, {
      headers: {
        Authorization: token && `Basic ${token}`,
      },
    });
  });
}