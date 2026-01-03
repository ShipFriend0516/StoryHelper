import './NewBadge.css';

interface NewBadgeProps {
  isNew?: boolean;
}

const NewBadge = ({ isNew = false }: NewBadgeProps) => {
  if (!isNew) return null;

  return (
    <span className="new-badge" aria-label="새로운 기능">
      NEW
    </span>
  );
};

export default NewBadge;
