export interface IndexSignature
{
  [index: string]: any // index signature
}

export interface ConnectionProperties extends IndexSignature
{
  "host": string,
  "port": number,
  "user": string,
  "password": string,
  "database": string,
}
