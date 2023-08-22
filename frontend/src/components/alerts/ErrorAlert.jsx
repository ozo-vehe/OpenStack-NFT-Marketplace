import { PropTypes } from 'prop-types';

export default function ErrorAlert({ message, setError }) {
  return (
    <>
      <div className="bg-red-100 border border-red-400 text-red-700 w-full px-4 py-3 rounded fixed top-20 left-0" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline capitalize">{message}.</span>
        <span onClick={()=>{setError({error: false})}} className="absolute top-0 bottom-0 right-0 px-4 py-3">
          <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <title>Close</title>
            <path
              d="M14.348 5.652a.5.5 0 010 .707L10.707 10l3.641 3.641a.5.5 0 11-.707.707L10 10.707l-3.641 3.641a.5.5
              0 01-.707-.707L9.293 10 5.652 6.359a.5.5 0 01.707-.707L10 9.293l3.641-3.641a.5.5
              0 01.707 0z"
            />
          </svg>
        </span>
      </div>
    </>
  )
}

ErrorAlert.propTypes = {
  message: PropTypes.string.isRequired,
  setError: PropTypes.func.isRequired,
};