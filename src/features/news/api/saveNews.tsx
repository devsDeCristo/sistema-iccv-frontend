import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../config/lib/axios/api-client';
import { queryClient } from '../../../config/lib/react-query/query-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../utils/service';
import { GET_NEWS, GET_NEWS_ADMIN } from '../constants';
import { NewsPayload } from '../types';

interface SaveNewsParams {
  /** Sem id é criação; com id é edição */
  id?: string;
  data: NewsPayload;
}

/**
 * Vai como `multipart/form-data` porque a notícia pode levar imagem, e é o
 * backend que sobe o arquivo para o storage — o mesmo caminho da capa do evento.
 */
const montarFormData = (data: NewsPayload) => {
  const formData = new FormData();

  formData.append('title', data.title);
  formData.append('content', data.content);
  formData.append('isPublished', String(data.isPublished));
  if (data.summary) formData.append('summary', data.summary);
  if (data.imageFile) formData.append('imageFile', data.imageFile);
  if (data.removeImage) formData.append('removeImage', 'true');

  return formData;
};

const saveNews = ({ id, data }: SaveNewsParams) => {
  const formData = montarFormData(data);
  const requisicao = id
    ? apiClient.put(`/news/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    : apiClient.post('/news', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

  return requisicao
    .then((response) => {
      handleResponseSuccess(
        response.data,
        id ? 'Notícia atualizada!' : 'Notícia criada!'
      )();
    })
    .catch(handleResponseThrowError());
};

type SaveNewsData = Awaited<ReturnType<typeof saveNews>>;

export const useSaveNews = ({
  onSuccess,
  ...options
}: MutationOptions<SaveNewsData, unknown, SaveNewsParams> = {}) =>
  useMutation({
    mutationFn: saveNews,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(GET_NEWS);
      queryClient.invalidateQueries(GET_NEWS_ADMIN);
      onSuccess?.(...args);
    },
    ...options,
  });
