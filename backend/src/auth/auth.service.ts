import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const email = dto.email.toLowerCase();
    this.logger.log(`Register attempt for email: ${email}`);

    const existing = await this.userModel.findOne({ email });
    if (existing) {
      this.logger.warn(`Registration failed — email already exists: ${email}`);
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const user = await this.userModel.create({
      email,
      passwordHash,
      displayName: dto.displayName || email.split('@')[0],
    });

    this.logger.log(`New user registered: ${email} (id: ${user._id})`);
    return {
      id: user._id,
      email: user.email,
      displayName: user.displayName,
    };
  }

  async login(dto: LoginDto) {
    const email = dto.email.toLowerCase();
    this.logger.log(`Login attempt for email: ${email}`);

    const user = await this.userModel.findOne({ email });
    if (!user) {
      this.logger.warn(`Login failed — no account found for: ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      this.logger.warn(`Login failed — wrong password for: ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign({ 
      userId: user._id,
      sub: user._id,
      username: user.displayName
    });

    this.logger.log(`Login successful for: ${email} (id: ${user._id})`);
    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        displayName: user.displayName,
      },
    };
  }

  async findById(userId: string) {
    const user = await this.userModel.findById(userId).select('-passwordHash');
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}