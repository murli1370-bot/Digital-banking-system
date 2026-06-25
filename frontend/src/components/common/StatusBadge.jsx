import { getStatusColor } from '../../utils/format';

const StatusBadge = ({ status }) => {
  const label = status?.replace(/_/g, ' ');
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusColor(status)}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
