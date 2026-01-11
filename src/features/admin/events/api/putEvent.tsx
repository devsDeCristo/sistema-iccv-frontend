import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_EVENTS } from '../constants';

interface FileUpload {
  logoFile?: File;
  coverFile?: File;
}

type PutUpdateEventProps = {
  data: any;
  id: string;
  files?: FileUpload;
};

const putUpdateEvent = ({ data, id, files }: PutUpdateEventProps) => {
  const formData = new FormData();

  // files das imagens do evento
  if (files?.logoFile) formData.append('logoFile', files.logoFile);
  if (files?.coverFile) formData.append('coverFile', files.coverFile);

  // resto dos dados do evento
  formData.append('name', data.name);
  formData.append('isActive', String(data.isActive));
  formData.append('startDate', data.startDate.toISOString());
  formData.append('endDate', data.endDate.toISOString());
  formData.append('type', data.type);
  formData.append('data', JSON.stringify(data.data));
  formData.append('groupRoles', JSON.stringify(data.groupRoles));
  if (data.groupLink) formData.append('groupLink', data.groupLink);

  return apiClient
    .put<boolean>(`/events/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    .then((response) => {
      handleResponseSuccess(response.data, 'Evento editado com sucesso!')();
    })
    .catch(handleResponseThrowError());
};

type PostCreateEventData = Awaited<ReturnType<typeof putUpdateEvent>>;

export const usePutUpdateEvent = ({
  onSuccess,
  ...options
}: MutationOptions<PostCreateEventData, unknown, any> = {}) => {
  return useMutation({
    mutationFn: putUpdateEvent,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(GET_EVENTS);
      onSuccess?.(...args);
    },
    ...options,
  });
};
