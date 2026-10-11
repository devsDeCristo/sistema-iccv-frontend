/**
 * Props de um campo de credencial (Client ID, token, segredo) para o
 * navegador não preencher com o login salvo do sistema.
 *
 * Um campo de senha com um campo de texto antes dele é, para o navegador, um
 * formulário de login: o Chrome punha o CPF no Client ID e a senha da pessoa
 * no Client Secret — e salvar mandava essa senha como credencial da igreja.
 * `autoComplete="off"` não adianta: o Chrome ignora em campo de senha. O que
 * ele respeita é `new-password` (campo de senha nova não recebe senha salva);
 * os `data-*` fazem o mesmo para 1Password, LastPass e Bitwarden.
 */
export const semAutopreencher = (segredo: boolean) => ({
  autoComplete: segredo ? 'new-password' : 'off',
  inputProps: {
    'data-1p-ignore': true,
    'data-lpignore': 'true',
    'data-bwignore': true,
    'data-form-type': 'other',
  },
});
