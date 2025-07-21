import { IsString, IsOptional, IsUUID, IsBoolean } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  content!: string;

  @IsUUID()
  postId!: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateCommentDto {
  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
