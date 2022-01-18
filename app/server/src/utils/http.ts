export const CORS_OPTION = {
  origin: [
    process.env.CORS_ORIGIN ?? "http://localhost:3000",
    new RegExp(process.env.CORS_ORIGIN_PREVIEW ?? "", "i"),
  ],
  optionsSuccessStatus: 200,
}
