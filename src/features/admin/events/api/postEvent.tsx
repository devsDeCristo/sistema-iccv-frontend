import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_EVENTS } from '../constants';
import { CreateEventPayload } from '../types';
interface FileUpload {
  logoFile?: File;
  coverFile?: File;
}
type PostCreateEventProps = {
  data: CreateEventPayload;
  files: FileUpload;
};

const postCreateEvent = ({ data, files }: PostCreateEventProps) => {
  const formData = new FormData();
  //files das imagens do evento
  if (files.logoFile) formData.append('logoFile', files.logoFile);
  if (files.coverFile) formData.append('coverFile', files.coverFile);
  //resto dos dados do evento
  formData.append('name', data.name);
  formData.append('status', data.status);
  formData.append('startDate', data.startDate.toISOString());
  formData.append('endDate', data.endDate.toISOString());
  formData.append('type', data.type);
  formData.append('data', JSON.stringify(data.data));
  formData.append('groupRoles', JSON.stringify(data.groupRoles));
  if (data.groupLink) formData.append('groupLink', data.groupLink);
  // vazio para admin e financeiro: o backend usa a igreja do perfil deles
  if (data.churchId) formData.append('churchId', data.churchId);

  return apiClient
    .post<boolean>(`/events`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((response) => {
      handleResponseSuccess(response.data, 'Evento criado com sucesso!')();
    })
    .catch(handleResponseThrowError());
};
type PostCreateEventData = Awaited<ReturnType<typeof postCreateEvent>>;

export const usePostCreateEvent = ({
  onSuccess,
  ...options
}: MutationOptions<PostCreateEventData, unknown, any> = {}) => {
  return useMutation({
    mutationFn: postCreateEvent,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(GET_EVENTS);
      onSuccess?.(...args);
    },
    ...options,
  });
};
