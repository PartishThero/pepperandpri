export function errorHandler(err, req, res, next) {
  console.error('[PEPPERANDPRI SERVER ERROR]:', err.message || err);

  const status = err.status || (err.message?.includes('Invalid file') ? 400 : 500);
  res.status(status).json({
    error: {
      message: err.message || 'Internal server error',
      code: err.code || 'SERVER_ERROR',
    },
  });
}

export default errorHandler;
