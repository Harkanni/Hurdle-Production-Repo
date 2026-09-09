var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Injectable, ConflictException, UnauthorizedException, NotFoundException, } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './schemas/user.schema.js';
const SALT_ROUNDS = 10;
let AuthService = class AuthService {
    userModel;
    jwtService;
    constructor(userModel, jwtService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
    }
    async register(dto) {
        const email = dto.email.toLowerCase();
        const existing = await this.userModel.findOne({ email });
        if (existing) {
            throw new ConflictException('An account with this email already exists');
        }
        const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
        const user = await this.userModel.create({
            email,
            passwordHash,
            displayName: dto.displayName || email.split('@')[0],
        });
        return {
            id: user._id,
            email: user.email,
            displayName: user.displayName,
        };
    }
    async login(dto) {
        const email = dto.email.toLowerCase();
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }
        const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid email or password');
        }
        const token = this.jwtService.sign({ userId: user._id });
        return {
            token,
            user: {
                id: user._id,
                email: user.email,
                displayName: user.displayName,
            },
        };
    }
    async findById(userId) {
        const user = await this.userModel.findById(userId).select('-passwordHash');
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }
};
AuthService = __decorate([
    Injectable(),
    __param(0, InjectModel(User.name)),
    __metadata("design:paramtypes", [Model,
        JwtService])
], AuthService);
export { AuthService };
//# sourceMappingURL=auth.service.js.map