// const {PDFParse} = require("pdf-parse");
// const ApiError = require("../utils/ApiError");

// async function extractText(buffer) {
//     let parser;
//     try{
//         parser = new PDFParse({data : buffer});
//         const result = await parser.getText();

//         const text = (result.text || "").trim();
//         if(!text || text.length < 50) {
//             throw ApiError.badRequest(
//                 "Could not extract readable text - is this a scanned/image-only PDF?"
//             );
//         }
//         return{
//             text,
//             meta: {
//                 numPages: result.pages?.length ?? result.numPages ?? null,
//             },
//         };
//     }catch(err){
//         if(err.isOperational) throw err;
//         throw ApiError.badRequest("Failed to parse PDF:" +err.message);
//     }finally{
//         try{
//             await parser?.destroy?.();
//         }catch{
//             // noop
//         }
//     }
// }

// module.exports = { extractText };

const pdf = require("pdf-parse");
const ApiError = require("../utils/ApiError");

async function extractText(buffer) {
  try {
    const result = await pdf(buffer);
    const text = (result.text || "").trim();

    if (!text || text.length < 50) {
      throw ApiError.badRequest(
        "Could not extract readable text - is this a scanned/image-only PDF?"
      );
    }

    return {
      text,
      meta: {
        numPages: result.numpages ?? null,
      },
    };
  } catch (err) {
    if (err.isOperational) throw err;
    throw ApiError.badRequest("Failed to parse PDF: " + err.message);
  }
}

module.exports = { extractText };