import cookieParser from 'cookie-parser';
import { nanoid } from 'nanoid';
import { config } from '../config.js';

export const cookies = cookieParser(config.cookieSecret);

export function orgAuth(req, res, next) {
  let orgId = req.signedCookies?.org_id;
  if (!orgId) {
    orgId = `org_${nanoid(12)}`;
    res.cookie('org_id', orgId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      signed: true,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
  }
  req.orgId = orgId;
  next();
}
