exports.requireNoSig = function(req, res, next) {
    if (req.session.sid) {
        return res.redirect("/thanks");
    } next();};

exports.requireSig = function(req, res, next) {
    if (!req.session.sid) {
        return res.redirect("/profile");
    } next();};

exports.requireNoUid = function(req, res, next) {
    if (req.session.uid) {
        return res.redirect("/petition");
    } next();};

exports.requireUid = function(req, res, next) {
    if (!req.session.uid) {
        return res.redirect("/registration");
    } next();};
