import { IsString, IsInt, Min, MinLength } from 'class-validator';

export class CreateExampleDto {
  @IsString()
  @MinLength(3)
  name!: string;

  @IsInt()
  @Min(0)
  value!: number;

  @IsString()
  type!: string;
}