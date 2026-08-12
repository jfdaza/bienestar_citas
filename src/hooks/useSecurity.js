import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// ============== RATE LIMITING ==============

const rateLimitStore = new Map();

export function useRateLimit(maxAttempts = 5, windowMs = 300000) {
    const [blocked, setBlocked] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);
    const timerRef = useRef(null);

    const checkRateLimit = useCallback((key) => {
        const now = Date.now();
        const record = rateLimitStore.get(key);

        if (!record) {
            rateLimitStore.set(key, { attempts: 1, firstAttempt: now });
            return true;
        }

        // Resetear si pasó el tiempo de ventana
        if (now - record.firstAttempt > windowMs) {
            rateLimitStore.set(key, { attempts: 1, firstAttempt: now });
            return true;
        }

        // Incrementar intentos
        record.attempts++;

        if (record.attempts > maxAttempts) {
            const timeLeft = Math.ceil((windowMs - (now - record.firstAttempt)) / 1000);
            setBlocked(true);
            setRemainingTime(timeLeft);

            // Timer para desbloquear
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setRemainingTime((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        setBlocked(false);
                        rateLimitStore.delete(key);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return false;
        }

        return true;
    }, [maxAttempts, windowMs]);

    const resetRateLimit = useCallback((key) => {
        rateLimitStore.delete(key);
        setBlocked(false);
        setRemainingTime(0);
        if (timerRef.current) clearInterval(timerRef.current);
    }, []);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    return { blocked, remainingTime, checkRateLimit, resetRateLimit };
}

// ============== TOKEN VALIDATION ==============

export function useTokenValidation() {
    const [isValid, setIsValid] = useState(true);
    const [checking, setChecking] = useState(false);

    const validateToken = useCallback(async () => {
        setChecking(true);
        try {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error || !session) {
                setIsValid(false);
                return false;
            }

            // Verificar si el token está por expirar (menos de 5 minutos)
            const expiresAt = session.expires_at * 1000;
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;

            if (expiresAt - now < fiveMinutes) {
                // Intentar refrescar el token
                const { error: refreshError } = await supabase.auth.refreshSession();
                if (refreshError) {
                    setIsValid(false);
                    return false;
                }
            }

            setIsValid(true);
            return true;
        } catch {
            setIsValid(false);
            return false;
        } finally {
            setChecking(false);
        }
    }, []);

    // Validar token periódicamente
    useEffect(() => {
        const interval = setInterval(validateToken, 60000); // Cada minuto
        validateToken(); // Validar al montar

        return () => clearInterval(interval);
    }, [validateToken]);

    return { isValid, checking, validateToken };
}

// ============== SECURITY LOGGING ==============

export async function logSecurityEvent() {
    return;
}

// ============== INPUT SANITIZATION ==============

export function sanitizeInput(input) {
    if (typeof input !== 'string') return input;

    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

export function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

export function validatePassword(password) {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
        isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
        minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar,
    };
}

// ============== CSRF PROTECTION ==============

export function generateCSRFToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function useCSRFProtection() {
    const tokenRef = useRef(generateCSRFToken());

    const getCSRFToken = useCallback(() => {
        return tokenRef.current;
    }, []);

    const validateCSRFToken = useCallback((token) => {
        return token === tokenRef.current;
    }, []);

    return { getCSRFToken, validateCSRFToken };
}
