import toast from "react-hot-toast";

export default function sFetch(
  route: string,
  method: string,
  data: any,
  onSuccess: (res: Response) => void
) {
  fetch(route, {
    method,
    body: JSON.stringify(data),
  }).then((res) => {
    if (res.status !== 200) {
      res.text().then((error) => toast.error(error));
    } else {
      onSuccess(res);
    }
  });
}
