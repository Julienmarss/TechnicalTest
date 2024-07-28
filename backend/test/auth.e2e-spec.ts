import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Authentication and User Management (e2e)', () => {
    let app: INestApplication;
    let prismaService: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(PrismaService)
            .useValue({
                user: {
                    create: jest.fn(),
                    findUnique: jest.fn(),
                    findMany: jest.fn(),
                    update: jest.fn(),
                    delete: jest.fn(),
                },
            })
            .compile();

        app = moduleFixture.createNestApplication();
        prismaService = moduleFixture.get(PrismaService);
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Authentication', () => {
        it('/auth/register (POST)', async () => {
            prismaService.user.create.mockResolvedValue({ id: '1', email: 'test@example.com' });

            const response = await request(app.getHttpServer())
                .post('/auth/register')
                .send({ email: 'test@example.com', password: 'password' })
                .expect(201);

            expect(response.body.access_token).toBeDefined();
        });

        it('/auth/login (POST)', async () => {
            prismaService.user.findUnique.mockResolvedValue({ id: '1', email: 'test@example.com', password: 'hashedPassword' });

            const response = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: 'test@example.com', password: 'password' })
                .expect(200);

            expect(response.body.access_token).toBeDefined();
        });

        it('/auth/google (GET)', async () => {
            return request(app.getHttpServer())
                .get('/auth/google')
                .expect(302)
                .expect('Location', /^https:\/\/accounts\.google\.com/);
        });

        it('/auth/linkedin (GET)', async () => {
            return request(app.getHttpServer())
                .get('/auth/linkedin')
                .expect(302)
                .expect('Location', /^https:\/\/www\.linkedin\.com\/oauth/);
        });
    });

    describe('User Management', () => {
        let token: string;

        beforeEach(async () => {
            // Simuler une connexion pour obtenir un token
            prismaService.user.findUnique.mockResolvedValue({ id: '1', email: 'test@example.com', password: 'hashedPassword' });
            const loginResponse = await request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: 'test@example.com', password: 'password' });
            token = loginResponse.body.access_token;
        });

        it('/users (GET)', async () => {
            prismaService.user.findMany.mockResolvedValue([
                { id: '1', email: 'user1@example.com' },
                { id: '2', email: 'user2@example.com' },
            ]);

            return request(app.getHttpServer())
                .get('/users')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .expect(res => {
                    expect(Array.isArray(res.body)).toBe(true);
                    expect(res.body.length).toBe(2);
                });
        });

        it('/users/:id (GET)', async () => {
            prismaService.user.findUnique.mockResolvedValue({ id: '1', email: 'user1@example.com' });

            return request(app.getHttpServer())
                .get('/users/1')
                .set('Authorization', `Bearer ${token}`)
                .expect(200)
                .expect(res => {
                    expect(res.body.id).toBe('1');
                    expect(res.body.email).toBe('user1@example.com');
                });
        });

        it('/users/:id (PATCH)', async () => {
            prismaService.user.update.mockResolvedValue({ id: '1', email: 'updated@example.com' });

            return request(app.getHttpServer())
                .patch('/users/1')
                .set('Authorization', `Bearer ${token}`)
                .send({ email: 'updated@example.com' })
                .expect(200)
                .expect(res => {
                    expect(res.body.id).toBe('1');
                    expect(res.body.email).toBe('updated@example.com');
                });
        });

        it('/users/:id (DELETE)', async () => {
            prismaService.user.delete.mockResolvedValue({ id: '1', email: 'deleted@example.com' });

            return request(app.getHttpServer())
                .delete('/users/1')
                .set('Authorization', `Bearer ${token}`)
                .expect(200);
        });
    });
});