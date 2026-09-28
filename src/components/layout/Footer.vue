<template>
    <footer class="footer">
        <div class="row g-0 justify-content-between fs-10 mt-4 mb-3">
            <div class="col-12 col-sm-auto text-center">
                <p class="mb-0 text-700">Gracias por usar NOA Transportes <span class="d-none d-sm-inline-block">|</span>
                    <br class="d-sm-none" /> 2026 &copy; <a href="https://www.simana.com.co/">Soluciones integrales Mana
                        S.A.S</a>
                </p>
            </div>
            <div class="col-12 col-sm-auto text-center">
                <p class="mb-0 text-700">v{{ appVersion }}</p>
            </div>
        </div>
    </footer>
</template>

<script setup>
import env from '@/utils/env.js';

const appVersion = env.APP_VERSION;
</script>
