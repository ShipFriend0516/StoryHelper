import './NewBadge.css';
import { getMessage } from '@src/shared/utils/i18n';

interface NewBadgeProps {
  isNew?: boolean;
}

const NewBadge = ({ isNew = false }: NewBadgeProps) => {
  if (!isNew) return null;

  return (
    <span className="new-badge" aria-label={getMessage('ui_new_feature')}>
      {getMessage('ui_new_badge')}
    </span>
  );
};

export default NewBadge;
