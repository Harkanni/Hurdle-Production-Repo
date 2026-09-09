import type { Request } from 'express';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        id: import("mongoose").Types.ObjectId;
        email: string;
        displayName: string;
    }>;
    login(dto: LoginDto): Promise<{
        token: string;
        user: {
            id: import("mongoose").Types.ObjectId;
            email: string;
            displayName: string;
        };
    }>;
    me(req: Request & {
        user: {
            userId: string;
        };
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./schemas/user.schema.js").User, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/user.schema.js").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    }, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Document<unknown, {}, import("./schemas/user.schema.js").User, {}, import("mongoose").DefaultSchemaOptions> & import("./schemas/user.schema.js").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & {
        id: string;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    logout(): {
        message: string;
    };
}
