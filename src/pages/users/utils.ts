import { ENUM_OPTION_LEADERSHIP_POSITION } from '../../features/users/constants';

export function getRole(leadershipPosition: string) {
  switch (leadershipPosition) {
    case ENUM_OPTION_LEADERSHIP_POSITION.SHEPHERD:
      return 1;
    case ENUM_OPTION_LEADERSHIP_POSITION.PRESBYTER:
      return 2;
    case ENUM_OPTION_LEADERSHIP_POSITION.EVANGELIST:
      return 3;
    case ENUM_OPTION_LEADERSHIP_POSITION.DEACON:
      return 4;
    case ENUM_OPTION_LEADERSHIP_POSITION.MEMBER:
      return 5;
    case ENUM_OPTION_LEADERSHIP_POSITION.NOT_POSITION:
      return 5;
  }
}
