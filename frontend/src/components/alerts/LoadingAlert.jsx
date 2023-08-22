import { PropTypes } from 'prop-types';

export default function LoadingAlert({ message }) {
  return (
    <div className="bg-blue-100 border border-blue-400 text-blue-700 w-full px-4 py-3 rounded fixed top-20 left-0" role="alert">
      <strong className="font-bold">Loading! </strong>
      <span className="block sm:inline capitalize">{message}.</span>
    </div>
  )
}

LoadingAlert.propTypes = {
  message: PropTypes.string.isRequired,
};