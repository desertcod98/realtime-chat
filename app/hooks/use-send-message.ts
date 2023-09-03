// import { useMutation } from "@tanstack/react-query";
// import axios from "axios";

// export const useSendMessage = useMutation({
//   mutationFn: (content: string, chatId: string) => { 
//     const url = "/api/messages/" + chatId;
//     const res = await axios.post(url, {content});  
//   },
//   onMutate: async (asset: CartItem) => {
//       await queryClient.cancelQueries({ queryKey: ['cart'] })
//       const previousCart = queryClient.getQueryData<CartItem[]>(['cart']);
//       if(previousCart){
//           queryClient.setQueryData<CartItem[]>(['cart'], [...previousCart, asset])
//       }else{
//           queryClient.setQueryData<CartItem[]>(['cart'], [asset])
//       }
//       return {previousCart: previousCart ?? []}
//   },
//   onError: (err, asset, context) => {
//       toast.error("Error adding item to cart.")
//       queryClient.setQueryData(['cart'], context?.previousCart ?? [])
//   }