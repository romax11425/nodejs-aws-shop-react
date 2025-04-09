import axios from "axios";
import React from "react";
import { useQuery, useQueryClient, useMutation } from "react-query";
import API_PATHS from "~/constants/apiPaths";
import { OrderStatus } from "~/constants/order";
import { Order } from "~/models/Order";

type FinishedOrder = {
  id: string;
  userId: string;
  cartId: string;
  comments: string | null;
  delivery: string;
  payment: string;
  status: string;
  total: string;
};

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const token = localStorage.getItem("authorization_token");
      const res = await axios.get<FinishedOrder[]>(`${API_PATHS.order}/order`, {
        headers: {
          Authorization: token && `Basic ${token}`,
        },
      });

      return res.data;
    },
  });
}

export function useInvalidateOrders() {
  const queryClient = useQueryClient();
  return React.useCallback(
    () => queryClient.invalidateQueries("orders", { exact: true }),
    []
  );
}

export function useUpdateOrderStatus() {
  return useMutation(
    (values: { id: string; status: OrderStatus; comment: string }) => {
      const { id, ...data } = values;
      return axios.put(`${API_PATHS.order}/order/${id}/status`, data, {
        headers: {
          Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
        },
      });
    }
  );
}

export function useSubmitOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: Omit<Order, "id">) => {
      const token = localStorage.getItem("authorization_token");
      return axios.put(`${API_PATHS.order}/order`, values, {
        headers: { Authorization: token && `Basic ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["orders"],
      });
    },
  });
}

export function useInvalidateOrder() {
  const queryClient = useQueryClient();
  return React.useCallback(
    (id: string) =>
      queryClient.invalidateQueries(["order", { id }], { exact: true }),
    []
  );
}

export function useDeleteOrder() {
  return useMutation((id: string) =>
    axios.delete(`${API_PATHS.order}/order/${id}`, {
      headers: {
        Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
      },
    })
  );
}