import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_PAYMENTS_EVENT } from '../constants';

interface FileUpload {
  receiptFile?: File;
}

type PutUpdatePaymentProps = {
  data: any;
  id: string;
  files?: FileUpload;
};

const putUpdatePayment = ({ data, id, files }: PutUpdatePaymentProps) => {
  const formData = new FormData();

  // files das imagens do evento
  if (files?.receiptFile) formData.append('receiptFile', files.receiptFile);

  // resto dos dados do evento
  formData.append('status', data.status);
  formData.append('method', String(data.method));

  return apiClient
    .put<boolean>(`/payments/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((response) => {
      handleResponseSuccess(response.data, 'Pagamento editado com sucesso!')();
    })
    .catch(handleResponseThrowError());
};

type PostCreatePaymentData = Awaited<ReturnType<typeof putUpdatePayment>>;

export const usePutUpdatePayment = ({
  onSuccess,
  ...options
}: MutationOptions<PostCreatePaymentData, unknown, any> = {}) => {
  return useMutation({
    mutationFn: putUpdatePayment,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(GET_PAYMENTS_EVENT);
      onSuccess?.(...args);
    },
    ...options,
  });
};
