import jwt from 'jsonwebtoken';

export function genToken(data: any) {
    const processedData = { 
        id: data._id,
        username: data.username,
        email: data.email,
        role: data.role
    }

    return jwt.sign(processedData, process.env.TOKEN_KEY);
}

export function verifyToken(token: string) {
    return jwt.verify(token, process.env.TOKEN_KEY);
}

