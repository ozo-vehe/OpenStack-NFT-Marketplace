import { PropTypes } from 'prop-types';

export default function SuccessAlert({ message }) {
  return (
    <div className="bg-green-100 border border-green-400 text-green-700 w-full px-4 py-3 rounded fixed top-20 left-0" role="alert">
      <strong className="font-bold">Success! </strong>
      <span className="block sm:inline capitalize">{message}.</span>
    </div>
  )
}

SuccessAlert.propTypes = {
  message: PropTypes.string.isRequired,
};