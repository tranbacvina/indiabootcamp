const url = require('url');

const getPageQuery = (originalURL) => {
// Phân tích URL
const parsedURL = url.parse(originalURL, true);

// Lấy các tham số từ query
const queryParameters = parsedURL.query;

// Lọc và xây dựng lại URL chỉ với tham số 'page'
const filteredQuery = { page: queryParameters.page }; // Chỉ giữ lại tham số 'page'
const newURL = url.format({
  protocol: parsedURL.protocol,
  host: parsedURL.host,
  pathname: parsedURL.pathname,
  query: filteredQuery,
});
return newURL
}


module.exports = {getPageQuery }