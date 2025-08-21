/*import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RedisService } from '../../common/redis/redis.service';

const mockUser: User = {
  id: 1,
  name: 'Anthony',
  email: 'anthony@example.com',
};

const mockCreateDto = {
  name: 'Anthony',
  email: 'anthony@example.com',
};

describe('UserService', () => {
  let service: UserService;
  let repo: jest.Mocked<Repository<User>>;
  let redis: jest.Mocked<RedisService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn().mockReturnValue(mockUser),
            save: jest.fn().mockResolvedValue(mockUser),
            find: jest.fn().mockResolvedValue([mockUser]),
          },
        },
        {
          provide: RedisService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repo = module.get(getRepositoryToken(User));
    redis = module.get(RedisService);
  });

  it('should create a user and clear cache', async () => {
    const result = await service.create(mockCreateDto);

    expect(repo.create).toHaveBeenCalledWith(mockCreateDto);
    expect(repo.save).toHaveBeenCalledWith(mockUser);
    expect(redis.del).toHaveBeenCalledWith('users:all');
    expect(result).toEqual(mockUser);
  });

  it('should return users from cache if present', async () => {
    redis.get.mockResolvedValue(JSON.stringify([mockUser]));

    const result = await service.findAll();

    expect(redis.get).toHaveBeenCalledWith('users:all');
    expect(repo.find).not.toHaveBeenCalled();
    expect(result).toEqual([mockUser]);
  });

  it('should return users from DB and cache them if no cache', async () => {
    redis.get.mockResolvedValue(null);

    const result = await service.findAll();

    expect(repo.find).toHaveBeenCalled();
    expect(redis.set).toHaveBeenCalledWith(
      'users:all',
      JSON.stringify([mockUser]),
      60,
    );
    expect(result).toEqual([mockUser]);
  });
});*/