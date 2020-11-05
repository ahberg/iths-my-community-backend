
class ResponseVO {
    statusCode: number;
    body: string;
  }
  

enum StatusCode {
  success = 200,
}

class Result {
  private statusCode: number;
  private body: Object

  constructor(statusCode: number, body: Object) {
    this.statusCode = statusCode;
    this.body = body;
  }

  /**
   * Serverless: According to the API Gateway specs, the body content must be stringified
   */
  bodyToString () {
    return {
      statusCode: this.statusCode,
      body: JSON.stringify(this.body),
    };
  }
}

export class MessageUtil {
  static success(body: object) {
      const result = new Result(StatusCode.success, body);
      console.log(result.bodyToString())
    return result.bodyToString();
  }

  static error(code: number = 1000, data:object) {
    const result = new Result(code, data);
    return result.bodyToString();
  }
}
