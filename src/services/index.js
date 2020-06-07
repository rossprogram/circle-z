import JsonSocket from 'json-socket-international';
import tls from 'tls';
import EventEmitter from 'events';

const certificate = `-----BEGIN CERTIFICATE-----
MIICrDCCAhUCFCIKrBD26vWDXFgQFVohl/qHAi94MA0GCSqGSIb3DQEBCwUAMIGU
MQswCQYDVQQGEwJVUzENMAsGA1UECAwET2hpbzERMA8GA1UEBwwIQ29sdW1idXMx
JDAiBgNVBAoMG1Jvc3MgTWF0aGVtYXRpY3MgRm91bmRhdGlvbjEYMBYGA1UEAwwP
cm9zc3Byb2dyYW0ub3JnMSMwIQYJKoZIhvcNAQkBFhRyb3NzQHJvc3Nwcm9ncmFt
Lm9yZzAeFw0yMDA1MTAyMzU0MzJaFw0yMDA2MDkyMzU0MzJaMIGUMQswCQYDVQQG
EwJVUzENMAsGA1UECAwET2hpbzERMA8GA1UEBwwIQ29sdW1idXMxJDAiBgNVBAoM
G1Jvc3MgTWF0aGVtYXRpY3MgRm91bmRhdGlvbjEYMBYGA1UEAwwPcm9zc3Byb2dy
YW0ub3JnMSMwIQYJKoZIhvcNAQkBFhRyb3NzQHJvc3Nwcm9ncmFtLm9yZzCBnzAN
BgkqhkiG9w0BAQEFAAOBjQAwgYkCgYEAnR9eBr/8vBymhKxbOZfTyFZbNaMmz2QH
5Ulm2GGfRztepswmOa9zcKbe0frCc3JBOyLdhu5Biclo1AnWEUDkQtSQprnWzJ37
Z9GqNpcfKKVOAhxS9vghFjtKBBSCpeXXCaFIJbdi2ICXulFUjZW1VaS15gPnFW04
fwhE15t2MacCAwEAATANBgkqhkiG9w0BAQsFAAOBgQAVuaCzzNalkTO0g1EGoXX4
YXYqNLf8FFUvs8wSvUyPmzYOLmHIhnCzUth3a9TSoRgVNEh1CMeuWXC7MZzV95mH
HWdUFMG3+6tvXbuBLPLzpMx0Zl2Qz+PFMlhSEL2ZiizFs6IhSWi1kbqJ6bpwDE3Y
yQruwFi7HBjJsJ2D7FMkGA==
-----END CERTIFICATE-----`;

class CircleZEmitter extends EventEmitter {}
let theSocket;

export function quit() {
  theSocket.sendEndMessage({
    type: 'quit',
  });
}

export function who() {
  theSocket.sendMessage({
    type: 'who',
  });
}

export function join(channel) {
  theSocket.sendMessage({
    type: 'join',
    name: channel,
  });
}

export function part(channel) {
  theSocket.sendMessage({
    type: 'part',
    name: channel,
  });
}

export function focus(channel) {
  theSocket.sendMessage({
    type: 'focus',
    name: channel,
  });
}

export function list() {
  theSocket.sendMessage({
    type: 'list',
  });
}

export function say(room, text) {
  theSocket.sendMessage({
    type: 'say',
    room,
    text,
  });
}

export function privmsg(user, text) {
  theSocket.sendMessage({
    type: 'privmsg',
    user,
    text,
  });
}

export function getDocument(id) {
  theSocket.sendMessage({
    type: 'getServerDocument',
    id,
  });
}

export function patchDocument(id, patch, checksum) {
  theSocket.sendMessage({
    type: 'patchServerDocument',
    id,
    patch,
    checksum,
  });
}

export function setDocument(id, text) {
  theSocket.sendMessage({
    type: 'setServerDocument',
    id,
    text,
  });
}

export function setDocumentCursor(id, cursor) {
  theSocket.sendMessage({
    type: 'setServerDocumentCursor',
    id,
    cursor,
  });
}

export function setDocumentSelection(id, range) {
  theSocket.sendMessage({
    type: 'setServerDocumentSelection',
    id,
    range,
  });
}

export function setBlackboardPointer(id, position) {
  theSocket.sendMessage({
    type: 'setBlackboardPointer',
    id,
    x: position.x,
    y: position.y,
  });
}

export function getBlackboard(id) {
  theSocket.sendMessage({
    type: 'getBlackboard',
    id,
  });
}

export function setBlackboardPdf(id, pdf) {
  theSocket.sendMessage({
    type: 'setBlackboardPdf',
    id,
    pdf: Buffer.from(pdf).toString('base64'),
  });
}

export function addBlackboardInk(id, uuid, style, points) {
  theSocket.sendMessage({
    type: 'addBlackboardInk',
    id,
    uuid,
    style,
    points,
  });
}

export function clearBlackboardInk(id) {
  theSocket.sendMessage({
    type: 'clearBlackboardInk',
    id,
  });
}

export function clearBlackboardPdf(id) {
  theSocket.sendMessage({
    type: 'clearBlackboardPdf',
    id,
  });
}

export function setBlackboardPage(id, page) {
  theSocket.sendMessage({
    type: 'setBlackboardPage',
    id,
    page,
  });
}

export function upvotePost(id) {
  theSocket.sendMessage({
    type: 'upvotePost',
    id,
  });
}

export function downvotePost(id) {
  theSocket.sendMessage({
    type: 'downvotePost',
    id,
  });
}

export function removePost(id) {
  theSocket.sendMessage({
    type: 'removePost',
    id,
  });
}

export function writePost(parent, subject, body) {
  theSocket.sendMessage({
    type: 'writePost',
    parent,
    subject,
    body,
  });
}

export function getPosts(parent) {
  theSocket.sendMessage({
    type: 'getPosts',
    parent,
  });
}

export function getRootPosts() {
  theSocket.sendMessage({
    type: 'getRootPosts',
  });
}

function error(socket, emitter, data) {
  emitter.emit('error', data.error);
}

function login(socket, emitter, data) {
  emitter.emit('connected', data.user);
}

function joined(socket, emitter, data) {
  emitter.emit('joined', data.name);
}

function users(socket, emitter, data) {
  emitter.emit('users', data.users);
}

function rooms(socket, emitter, data) {
  console.log('rooms');
  emitter.emit('rooms', data.rooms);
}

function onSay(socket, emitter, data) {
  emitter.emit('say', data.room, data.from, data.text);
}

function onPrivmsg(socket, emitter, data) {
  emitter.emit('privmsg', data.from, data.text);
}

function setClientDocument(socket, emitter, data) {
  console.log('INCOMING=', data);
  emitter.emit('setDocument', data.id, data.text);
}

function setClientDocumentCursor(socket, emitter, data) {
  emitter.emit('setDocumentCursor', data.id, data.userId, data.cursor);
}

function setClientDocumentSelection(socket, emitter, data) {
  emitter.emit('setDocumentSelection', data.id, data.userId, data.range);
}

function patchClientDocument(socket, emitter, data) {
  emitter.emit('patchDocument', data.id, data.patch, data.checksum);
}

function getClientDocument(socket, emitter, data) {
  emitter.emit('getDocument', data.id);
}

function setBlackboard(socket, emitter, data) {
  const update = data;
  if (data.pdf !== undefined) {
    update.pdf = Buffer.from(data.pdf, 'base64');
  }
  
  emitter.emit('updateBlackboard', data.id, update);
}

function onAddBlackboardInk(socket, emitter, data) {
  emitter.emit('addBlackboardInk', data.id, data.artist, data.uuid, data.style, data.points);
}

function onSetBlackboardPointer(socket, emitter, data) {
  emitter.emit('setBlackboardPointer', data.id, data.user, { x: data.x, y: data.y });
}

function addPosts(socket, emitter, data) {
  emitter.emit('addPosts', data.posts);
}

const callbacks = {
  error,
  login,
  joined,
  users,
  rooms,
  say: onSay,
  privmsg: onPrivmsg,
  
  setClientDocument,
  patchClientDocument,
  getClientDocument,
  setClientDocumentCursor,
  setClientDocumentSelection,
  
  setBlackboard,
  addBlackboardInk: onAddBlackboardInk,
  setBlackboardPointer: onSetBlackboardPointer,

  addPosts,
};

function handleMessage(socket, emitter, data) {
  console.log(data);

  if (data.type) {
    if (callbacks[data.type]) {
      callbacks[data.type](socket, emitter, data);        
    } else {
      emitter.emit('error', `missing handler for ${data.type}`);
    }
  } else {
    emitter.emit('error', 'missing data.type');
  }
}

export function connect(options) {
  const emitter = new CircleZEmitter();

  const s = tls.connect({
    ca: [certificate],
    host: options.host,
    port: options.port,
    rejectUnauthorized: false,
  }, () => {
    theSocket = new JsonSocket(s);
    const socket = theSocket;

    socket.on('message', (message) => {
      if (message.error) {
        handleMessage(socket, emitter,
                      {
                        type: 'error',
                        ...message, 
                      });
      } else {
        handleMessage(socket, emitter, message);
      }
    });
    
    socket.sendMessage({
      type: 'login',
      password: options.password,
      email: options.email,
    });
  });

  s.on('close', () => {
    console.log('socket closed');
    emitter.emit('disconnected');
  });
  
  s.on('end', () => {
    console.log('server ends connection');
    emitter.emit('disconnected');
  });
  
  s.on('error', (err) => {
    emitter.emit('error', err);
  });

  return emitter;
}
