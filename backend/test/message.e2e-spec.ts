import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtService } from '@nestjs/jwt';

describe('MessageController (e2e)', () => {
    let app: INestApplication;
    let jwtService: JwtService;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        jwtService = moduleFixture.get<JwtService>(JwtService);
        await app.init();
    });

    it('/messages (POST)', async () => {
        const token = jwtService.sign({ userId: '1', email: 'test@example.com' });
        const createMessageDto = { content: 'Test message', receiverId: '2' };

        return request(app.getHttpServer())
            .post('/messages')
            .set('Authorization', `Bearer ${token}`)
            .send(createMessageDto)
            .expect(201)
            .expect(res => {
                expect(res.body).toHaveProperty('id');
                expect(res.body.content).toBe(createMessageDto.content);
                expect(res.body.senderId).toBe('1');
                expect(res.body.receiverId).toBe('2');
            });
    });

    it('/messages/:userId (GET)', async () => {
        const token = jwtService.sign({ userId: '1', email: 'test@example.com' });

        return request(app.getHttpServer())
            .get('/messages/2')
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect(res => {
                expect(Array.isArray(res.body)).toBe(true);
            });
    });

    afterAll(async () => {
        await app.close();
    });
});