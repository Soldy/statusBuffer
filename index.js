'use strict';
const confrc = new (require('confrc')).confrc();
const poolrc = (require('poolrc')).poolrc;
const http = require('http');

const statusPool = new poolrc(10000);

const serverBase = function(){
    const start=function(){
        http.createServer(function (req, res) {
            let post = '';
            req.on('data', function (chunk) {
                post += chunk;
            });
            req.on('end', async function () {
                if(req.url === '/')
                    return res.end();
                if(req.method === 'GET')
                    return getCall(post, req, res);
                if(req.method === 'POST')
                    return postCall(post, req, res);
                return notAllowedMethod(res);
            });
        }).listen(
            confrc.get('statusBuffer').httpd.port,
            confrc.get('statusBuffer').httpd.address
        );
    };
    const getCall = function(post, req, res){
        if(!statusPool.check(req.url))
            return notExist(res);
        res.writeHead(200);
        res.write(
            JSON.stringify(
                statusPool.get(req.url)
            )
        );
        return res.end();
    }
    const postCall = function(post, req, res){
        try{
            post = JSON.parse(post);
        }catch(e){
            return badRequest(res);
        }
        statusPool.set(
            req.url,
            post
        );
        return end(res);
    }
    const end = function(res){
        res.writeHead(200);
        res.write(
            JSON.stringify({
                'result':'ok'
            })
        );
        return res.end();

    };
    const notExist = function(res){
        res.writeHead(405);
        res.write(
            JSON.stringify({
                'result':'Method Not Allowed'
            })
        );
        return res.end();
    };
    const notAllowedMethod = function(res){
        res.writeHead(405);
        res.write(
            JSON.stringify({
                'result':'Method Not Allowed'
            })
        );
        return res.end();
    };
    const badRequest = function(res){
        res.writeHead(400);
        res.write(
            JSON.stringify({
                'result':'bad request'
            })
        );
        return res.end();
    };
    const stop=function(){ 
        http.close();
    };
    process.on('EXIT', stop);
    process.on('SIGINT', stop);
    start();
};

(new serverBase());

