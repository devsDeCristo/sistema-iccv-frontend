import { UseQueryOptions, useQuery } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { GET_USERS } from '../constants';
import { User } from '../../../../types/user';

type GetUsersParams = {
  userId?: string;
  /**
   * Lente de igreja: devolve quem está nos eventos dela mais os administradores
   * dela. Só o super admin muda alguma coisa com isto — o recorte dos outros o
   * backend já aplica pelo vínculo de quem pediu.
   */
  churchId?: string;
};

const getUsers = ({ userId, churchId }: GetUsersParams) => {
  const urlWithId = userId ? `/${userId}` : '';
  const query = churchId ? `?churchId=${encodeURIComponent(churchId)}` : '';

  return apiClient
    .get<User[] | User>(`/users${urlWithId}${query}`)
    .then((response) => response.data);
};

type GetUsersData = Awaited<ReturnType<typeof getUsers>>;

export const useGetUsers = (
  params: GetUsersParams,
  options: Omit<
    UseQueryOptions<GetUsersData, unknown, GetUsersData>,
    'queryKey' | 'queryFn'
  > = {}
) => {
  return useQuery([GET_USERS, params], () => getUsers(params), options);
};
