<script setup lang="ts">
// Current year for copyright
const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <div class="container footer-container">
      <div class="footer-info">
        <p class="copyright">© {{ currentYear }} 数据库工程师在线练习系统</p>
      </div>
      
      <div class="footer-links">
        <a href="#" class="footer-link">关于我们</a>
        <a href="#" class="footer-link">帮助中心</a>
        <a href="#" class="footer-link">隐私政策</a>
        <a href="#" class="footer-link">联系我们</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background-color: var(--color-primary);
  color: white;
  padding: var(--spacing-md) 0;
  margin-top: auto;
}

.footer-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.copyright {
  margin: 0;
  font-size: var(--font-size-sm);
}

.footer-links {
  display: flex;
}

.footer-link {
  color: white;
  text-decoration: none;
  margin-left: var(--spacing-md);
  font-size: var(--font-size-sm);
  transition: color var(--transition-fast);
}

.footer-link:hover {
  color: var(--color-secondary);
}

@media (max-width: 767.98px) {
  .footer-container {
    flex-direction: column;
  }
  
  .footer-links {
    margin-top: var(--spacing-sm);
  }
  
  .footer-link {
    margin: 0 var(--spacing-xs);
    font-size: var(--font-size-xs);
  }
}
</style> 