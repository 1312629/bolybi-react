/* GET Angular SPA page */
module.exports.angularApp = function(req, res){
  res.sendFile('./app_client/index.html');
};
