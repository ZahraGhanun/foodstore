import { ref } from "vue";

export const user = ref(
    JSON.parse(localStorage.getItem("user"))
);

export const token = ref(
    localStorage.getItem("token")
);

export function logout() {

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    user.value = null;
    token.value = null;

    window.location.href = "/";
}