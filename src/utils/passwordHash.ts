import bcrypt from 'bcrypt';

export function hashPassword(password: string) {
    password = password ?? '';

    if(!password) {
        return null;
    }

    const saltRounds = Number(process.env.SALT) || 12;
    const salt = bcrypt.genSaltSync(saltRounds);

    return bcrypt.hashSync(password, salt);
}

export function comparePassword(password: string, hash: string) {
    password = password ?? '';

    if(!password) {
        return false;
    }

    return bcrypt.compareSync(password, hash);
}