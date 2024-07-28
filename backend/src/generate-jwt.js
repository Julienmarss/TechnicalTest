const { JwtService } = require('@nestjs/jwt');

const jwtService = new JwtService({
    secret: 'ZcG8IXci3s4AIYzioL5HIDXSnuZ1QP3rXbNlM5w3OuU=', // Remplacez par votre vrai secret JWT
    signOptions: { expiresIn: '1h' },
});

const payload = {
    sub: '1', // Remplacez par l'ID de l'utilisateur
    email: 'user@example.com', // Remplacez par l'email de l'utilisateur
};

const token = jwtService.sign(payload);
console.log('JWT Token:', token);