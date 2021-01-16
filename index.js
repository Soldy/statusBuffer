/*
 *  @Soldy\statusBuffer\2021.01.16\GPL3
 */
'use strict';
const confrc = new (require('confrc')).confrc();
const poolrc = (require('poolrc')).poolrc;
const http = require('http');
const src = new (require('statusrc')).statusrc;

const statusPool = new poolrc(10000);

/*
 * @prototype
 */
const serverBase = function(){
    /*
     *  @private
     *  @return {integer}
     */
    const start=function(){
        http.createServer(function (req, res) {
            let post = '';
            req.on('data', function (chunk) {
                post += chunk;
            });
            req.on('end', async function () {
                if(req.url === '/')
                    return src.notExist(res);
                if(req.method === 'GET')
                    return getCall(post, req, res);
                if(req.method === 'POST')
                    return postCall(post, req, res);
                return src.notAllowedMethod(res);
            });
        }).listen(
            confrc.get('statusBuffer').httpd.port,
            confrc.get('statusBuffer').httpd.address
        );
    };
    /*
     *  @param {object} post
     *  @param {object} req
     *  @param {object} res
     *  @private
     *  @return {integer}
     *
     */
    const getCall = function(post, req, res){
        if(!statusPool.check(req.url))
            return src.notExist(res);
        return src.end(
           res,
           200,
           statusPool.get(req.url)
        );
    };
    /*
     *  @param {object} post
     *  @param {object} req
     *  @param {object} res
     *  @private
     *  @return {integer}
     *
     */
    const postCall = function(post, req, res){
        try{
            post = JSON.parse(post);
        }catch(e){
            return src.badRequest(res);
        }
        statusPool.set(
            req.url,
            post
        );
        return src.ok(res);
    };
    // constructor
    start();
};

(new serverBase());

