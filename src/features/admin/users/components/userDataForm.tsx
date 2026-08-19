import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, LinearProgress, Stack } from '@mui/material';
import { Edit } from '@mui/icons-material';
import { Form } from './form';
import { useGetUsers } from '../api/getUsers';
import { usePutUser } from '../api/putUser';
import { REGISTER_USERS_SCHEMA } from '../constants';
import { formValuesToUserPayload, userToFormValues } from '../utils';
import { RegisterUsersFormType, User } from '../../../../types/user';

interface UserDataFormProps {
  userId: string;
  /** Rótulo do botão que libera a edição */
  editLabel?: string;
  /** Avisa quem embutiu o bloco que os dados mudaram no servidor */
  onSaved?: () => void;
}

/**
 * Os dados do usuário em leitura, com edição sob demanda: é o miolo da tela de
 * detalhes, embutível em outro fluxo. O posto de foto do check-in usa para
 * conferir e corrigir os dados com o inscrito antes de tirar a foto.
 */
function UserDataForm({
  userId,
  editLabel = 'Corrigir dados',
  onSaved,
}: UserDataFormProps) {
  const [editando, setEditando] = useState(false);
  const { data, isLoading, refetch } = useGetUsers(
    { userId },
    { enabled: !!userId }
  );
  const usuario = data as User | undefined;

  const methods = useForm<RegisterUsersFormType>({
    resolver: zodResolver(REGISTER_USERS_SCHEMA),
    defaultValues: userToFormValues(usuario),
  });

  // troca de usuário ou dado recém-salvo: o form volta a refletir o servidor e
  // a edição fecha, para ninguém continuar digitando sobre valores antigos
  useEffect(() => {
    methods.reset(userToFormValues(usuario));
    setEditando(false);
  }, [usuario]);

  const { mutateAsync: salvarUsuario, isLoading: salvando } = usePutUser();

  const onSubmit = async (valores: RegisterUsersFormType) => {
    try {
      await salvarUsuario({
        userId,
        data: formValuesToUserPayload(valores),
      });
      await refetch();
      setEditando(false);
      onSaved?.();
    } catch {
      // erros já são exibidos por handleResponseThrowError
    }
  };

  return (
    <Stack spacing={1}>
      {isLoading && <LinearProgress />}

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Form readOnly={!editando} />

          <Stack
            direction="row"
            justifyContent="flex-end"
            spacing={1}
            sx={{ mt: 2 }}
          >
            {editando ? (
              <>
                <Button
                  variant="outlined"
                  disabled={salvando}
                  onClick={() => {
                    methods.reset(userToFormValues(usuario));
                    setEditando(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button variant="contained" type="submit" disabled={salvando}>
                  {salvando ? 'Salvando...' : 'Salvar dados'}
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                disabled={isLoading}
                onClick={() => setEditando(true)}
              >
                {editLabel}
              </Button>
            )}
          </Stack>
        </form>
      </FormProvider>
    </Stack>
  );
}

export { UserDataForm };
