import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateChannelDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Channel name can only contain letters, numbers, underscores and hyphens',
  })
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;
}
