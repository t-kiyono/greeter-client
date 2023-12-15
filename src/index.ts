import {
  GreeterClient,
  GreeterRequest,
  GreeterReply,
} from '@t-kiyono/greeter-grpc-ts';
import { credentials } from '@grpc/grpc-js';

const client = new GreeterClient('localhost:6565', credentials.createInsecure());

async function main() {
  // console.log(await sayHelloUnary('Ryo'));
  // console.log(await sayHelloServerStreaming('Ryo'));
  // console.log(await sayHelloClientStreaming(['Ryo', 'Taro']));
  console.log(await sayHelloBidirectionalStreaming(['Ryo', 'Taro']));
}

const sayHelloUnary = (name: string) => new Promise<GreeterReply>((resolve, reject) => {
  const request = new GreeterRequest();
  request.setName(name);

  client.sayHelloUnary(request, (error, response) => {
      if (error) reject(error);
      resolve(response);
  });
}).then((value) => value.getMessage());

const sayHelloServerStreaming = (name: string) => new Promise<string[]>((resolve) => {
  const response: string[] = [];

  const request = new GreeterRequest();
  request.setName(name);

  const readableStream = client.sayHelloServerStreaming(request);
  readableStream.on('data', (data: GreeterReply) => {
    response.push(data.getMessage());
  });
  readableStream.on('end', () => {
    resolve(response);
  });
});

const sayHelloClientStreaming = (names: string[]) => new Promise<string>((resolve, reject) => {
  const requestStream = client.sayHelloClientStreaming((error, response) => {
    if (error) reject(error);
    resolve(response.getMessage());
  });

  names.forEach(name => {
    const request = new GreeterRequest();
    request.setName(name);

    requestStream.write(request);
  });
  requestStream.end();
});

const sayHelloBidirectionalStreaming = (names: string[]) => new Promise<string[]>((resolve) => {
  const stream = client.sayHelloBidirectionalStreaming();

  // response event
  const response: string[] = [];

  stream.on('data', (data: GreeterReply) => {
    response.push(data.getMessage());
  })
  stream.on('end', () => {
    resolve(response);
  });

  // request event
  names.forEach(name => {
    const request = new GreeterRequest();
    request.setName(name);

    stream.write(request);
  });
  stream.end();
});

main();
